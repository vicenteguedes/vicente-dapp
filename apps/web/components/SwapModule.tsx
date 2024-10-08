import { useClient } from "@/contexts/ClientProvider";
import { Box, Button, Container, IconButton, Typography } from "@mui/material";
import CustomTextField from "./CustomTextField";
import { FormEventHandler, forwardRef, useEffect, useState } from "react";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import Image from "next/image";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Address, formatUnits, maxUint256, parseUnits } from "viem";
import { SEPOLIA_DATA, UNISWAP_ROUTER_ABI, UNISWAP_V2_PAIR_ABI } from "@/utils/constants";
import { enqueueSnackbar } from "notistack";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsDialog from "./SettingsDialog";

const DEFAULT_SLIPPAGE_IN_PERCENT = 5n; // 5%;

interface TokenData {
  name: string;
  amount?: string;
  iconUrl: string;
  decimals: number;
  address: string;
}

interface NumericCustomProps {
  name: string;
  decimalScale: number;
}

const cleanNumericString = (str: string) => str.replace(/[^\d.-]/g, "");

const NumericFormatCustom = forwardRef<NumericFormatProps, NumericCustomProps>(
  function NumericFormatCustom(props, ref) {
    const { decimalScale, ...other } = props;

    return <NumericFormat {...other} getInputRef={ref} thousandSeparator decimalScale={decimalScale} />;
  }
);

export default function SwapModule() {
  const { client, account, balances, reserves } = useClient();

  const getCurrencyReserve = (currencyData: TokenData) => reserves[currencyData.name as keyof typeof reserves];

  const [slippage, setSlippage] = useState<bigint>(DEFAULT_SLIPPAGE_IN_PERCENT);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [inToken, setInCurrency] = useState<TokenData>({
    name: "BUSD",
    iconUrl: "https://smardex.io/images/tokens/busd.svg",
    decimals: SEPOLIA_DATA.contracts["BUSD"].decimals,
    address: SEPOLIA_DATA.contracts["BUSD"].address,
  });

  const [outToken, setOutCurrency] = useState<TokenData>({
    name: "WBTC",
    iconUrl: "https://smardex.io/images/tokens/wbtc.svg",
    decimals: SEPOLIA_DATA.contracts["WBTC"].decimals,
    address: SEPOLIA_DATA.contracts["WBTC"].address,
  });

  // determine whether it is the in or the out currency that the user edited last
  const [isInCurrency, setIsInCurrency] = useState(true);

  const [allowance, setAllowance] = useState<bigint>(0n);

  useEffect(() => {
    const fetchAllowance = async () => {
      if (!client) {
        return;
      }

      try {
        const inTokenAllowance = (await client.readContract({
          address: inToken.address as Address,
          abi: UNISWAP_V2_PAIR_ABI,
          functionName: "allowance",
          args: [account, SEPOLIA_DATA.contracts["UNISWAP_ROUTER"].address],
        })) as bigint;

        setAllowance(inTokenAllowance);
      } catch (error) {
        console.error("Error getting allowance:", error);
      }
    };

    fetchAllowance();
  }, [inToken?.name, balances]);

  const handleSettingsClose = () => setSettingsOpen(false);
  const handleSettingsSave = (newSlippage: bigint) => setSlippage(newSlippage);

  const executeSwap = async () => {
    try {
      if (!client) {
        return;
      }

      const amountIn = parseUnits(cleanNumericString(inToken.amount!), inToken.decimals);
      const amountOut = parseUnits(cleanNumericString(outToken.amount!), outToken.decimals);

      const path = [inToken.address, outToken.address];

      // expires in 20 minutes
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

      // check allowance and approve if necessary
      if (amountIn > allowance) {
        await client
          .writeContract({
            account: account as Address,
            address: inToken.address as Address,
            abi: UNISWAP_V2_PAIR_ABI,
            functionName: "approve",
            args: [SEPOLIA_DATA.contracts["UNISWAP_ROUTER"].address, maxUint256],
            chain: SEPOLIA_DATA.chain,
          })
          .then(() => {
            setAllowance(maxUint256);
          });
      }

      if (isInCurrency) {
        await swapExactTokenForToken(amountIn, amountOut, path, deadline);
      } else {
        await swapTokenForExactToken(amountIn, amountOut, path, deadline);
      }
    } catch (error) {
      console.error("Error swapping tokens:", error);
      enqueueSnackbar("Swap failed", { variant: "error" });
    }
  };

  const switchTokens = () => {
    const temp = outToken;
    setOutCurrency(inToken);
    setInCurrency(temp);
  };

  const getAmountOut = (newInAmount: string) => {
    const inCurrencyReserve = getCurrencyReserve(inToken);
    const outCurrencyReserve = getCurrencyReserve(outToken);

    if (!newInAmount || !inCurrencyReserve || !outCurrencyReserve) {
      return 0;
    }

    const parsedAmountIn = parseUnits(newInAmount, inToken.decimals);

    const numerator = parsedAmountIn * 997n * outCurrencyReserve;
    const denominator = inCurrencyReserve * 1000n + parsedAmountIn * 997n;
    const amountOut = numerator / denominator;

    return formatUnits(amountOut, outToken.decimals);
  };

  const getAmountIn = (newOutAmount: string) => {
    const inCurrencyReserve = getCurrencyReserve(inToken);
    const outCurrencyReserve = getCurrencyReserve(outToken);

    if (!newOutAmount || !inCurrencyReserve || !outCurrencyReserve) {
      return 0;
    }

    const parsedAmountOut = parseUnits(newOutAmount, outToken.decimals);

    const numerator = inCurrencyReserve * parsedAmountOut * 1000n;
    const denominator = (outCurrencyReserve - parsedAmountOut) * 997n;

    if (denominator <= 0n) {
      return 0;
    }

    const amountIn = numerator / denominator + 1n;

    return formatUnits(amountIn, inToken.decimals);
  };

  const swapExactTokenForToken = async (amountIn: bigint, amountOut: bigint, path: string[], deadline: number) => {
    const slippageReduction = (amountOut * slippage) / BigInt(100);
    const amountOutMin = amountOut - slippageReduction;

    if (amountIn > BigInt(balances[inToken.name as keyof typeof balances])) {
      enqueueSnackbar("Insufficient balance", { variant: "error" });
      return;
    }

    await client!
      .writeContract({
        account: account as Address,
        address: SEPOLIA_DATA.contracts["UNISWAP_ROUTER"].address,
        abi: UNISWAP_ROUTER_ABI,
        functionName: "swapExactTokensForTokens",
        args: [amountIn, amountOutMin, path, account, deadline],
        chain: SEPOLIA_DATA.chain,
      })
      .then(() => {
        enqueueSnackbar("Swap successful!", { variant: "success" });
      });
  };

  const swapTokenForExactToken = async (amountIn: bigint, amountOut: bigint, path: string[], deadline: number) => {
    const slippageExcedent = (amountIn * slippage) / BigInt(100);
    const amountInMax = amountIn + slippageExcedent;

    if (amountInMax > BigInt(balances[inToken.name as keyof typeof balances])) {
      enqueueSnackbar("Insufficient balance", { variant: "error" });
      return;
    }

    if (amountOut > getCurrencyReserve(outToken)) {
      enqueueSnackbar("Insufficient liquidity", { variant: "error" });
      return;
    }

    await client!
      .writeContract({
        account: account as Address,
        address: SEPOLIA_DATA.contracts["UNISWAP_ROUTER"].address,
        abi: UNISWAP_ROUTER_ABI,
        functionName: "swapTokensForExactTokens",
        args: [amountOut, amountInMax, path, account, deadline],
        chain: SEPOLIA_DATA.chain,
      })
      .then(() => {
        enqueueSnackbar("Swap successful!", { variant: "success" });
      });
  };

  const handleInInputChange = (e: any) => {
    const amountOut = getAmountOut(cleanNumericString(e.target.value));

    setIsInCurrency(true);

    setInCurrency({
      ...inToken,
      amount: e.target.value,
    });

    setOutCurrency({
      ...outToken,
      amount: amountOut ? amountOut.toString() : "",
    });
  };

  const handleOutInputChange = (e: any) => {
    const amountIn = getAmountIn(cleanNumericString(e.target.value));

    setIsInCurrency(false);

    setOutCurrency({
      ...outToken,
      amount: e.target.value,
    });

    setInCurrency({
      ...inToken,
      amount: amountIn ? amountIn.toString() : "",
    });
  };

  const renderCurrencyInputField = (
    currency: TokenData,
    handleInputChange: FormEventHandler<HTMLDivElement>,
    withMaxButton = false
  ) => {
    return (
      <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
        <Image src={currency.iconUrl} alt={currency.name} width={40} height={40} style={{ marginRight: 10 }} />
        <CustomTextField
          fullWidth
          margin="none"
          id={currency.name}
          label={`Amount (${currency.name})`}
          variant="outlined"
          value={currency.amount || ""}
          onInput={handleInputChange}
          slotProps={{
            input: {
              inputComponent: NumericFormatCustom as any,
              inputProps: {
                decimalScale: currency.name === "BUSD" ? 4 : 8,
              },
            },
          }}
          sx={{ width: withMaxButton ? "100%" : "85%" }}
        />
        {withMaxButton && (
          <Button
            variant="text"
            onClick={() => {
              const event = {
                target: {
                  value: formatUnits(BigInt(balances[currency.name as keyof typeof balances]), currency.decimals),
                },
              } as React.ChangeEvent<HTMLInputElement>;
              handleInputChange(event);
            }}
          >
            Max
          </Button>
        )}
      </Box>
    );
  };

  return (
    <Box flex={1}>
      <Box
        sx={{
          width: "100%",
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          p: 3,
          marginTop: 4,
        }}
        textAlign={"center"}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography mb={2} variant="body1" color="textSecondary">
            Swap
          </Typography>

          <IconButton onClick={() => setSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton>
        </Box>

        <Container>
          <Box display="flex" flexDirection="column">
            {renderCurrencyInputField(inToken, handleInInputChange, true)}

            <Button
              sx={{
                marginY: 1,
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
              onClick={switchTokens}
              variant="text"
            >
              <SwapVertIcon />
            </Button>

            {renderCurrencyInputField(outToken, handleOutInputChange)}
          </Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={executeSwap}
            style={{ marginTop: 20, borderRadius: 6, width: "25%" }}
            disabled={!inToken.amount || !outToken.amount}
          >
            Swap
          </Button>
        </Container>
      </Box>

      <SettingsDialog open={settingsOpen} onClose={handleSettingsClose} onSave={handleSettingsSave} />
    </Box>
  );
}
