import { useClient } from "@/contexts/ClientProvider";
import { Box, Button, Typography } from "@mui/material";
import CustomTextField from "./CustomTextField";
import { forwardRef, useEffect, useState } from "react";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import Image from "next/image";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { Address, formatUnits, maxUint256, parseUnits } from "viem";
import { SEPOLIA_DATA, UNISWAP_ROUTER_ABI, UNISWAP_V2_PAIR_ABI } from "@/utils/constants";
import { enqueueSnackbar } from "notistack";

// TODO: make state
const SLIPPAGE_IN_PERCENT = 5n; // 5%;

interface CurrencyData {
  name: string;
  reserve?: bigint;
  amount?: string;
  iconUrl: string;
  decimals: number;
  address: string;
}

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  decimalScale: number;
}

const cleanNumericString = (str: string) => str.replace(/[^\d.-]/g, "");

const NumericFormatCustom: any = forwardRef<NumericFormatProps, CustomProps>(function NumericFormatCustom(props, ref) {
  const { onChange, decimalScale, ...other } = props;

  return <NumericFormat {...other} getInputRef={ref} thousandSeparator decimalScale={decimalScale} />;
});

export default function SwapModule() {
  const { client, account, balances } = useClient();

  const [inCurrency, setInCurrency] = useState<CurrencyData>({
    name: "BUSD",
    iconUrl: "https://smardex.io/images/tokens/busd.svg",
    decimals: SEPOLIA_DATA.contracts["BUSD"].decimals,
    address: SEPOLIA_DATA.contracts["BUSD"].address,
  });

  const [outCurrency, setOutCurrency] = useState<CurrencyData>({
    name: "WBTC",
    iconUrl: "https://smardex.io/images/tokens/wbtc.svg",
    decimals: SEPOLIA_DATA.contracts["WBTC"].decimals,
    address: SEPOLIA_DATA.contracts["WBTC"].address,
  });

  // determine whether is the in or out currency that the user is swapping
  const [isInCurrency, setIsInCurrency] = useState(true);

  useEffect(() => {
    const fetchReserves = async () => {
      if (!client) {
        return;
      }

      try {
        const [token0Reserve, token1Reserve] = (await client.readContract({
          address: SEPOLIA_DATA.contracts["BUSD_WBTC"].address,
          abi: UNISWAP_V2_PAIR_ABI,
          functionName: "getReserves",
        })) as bigint[];

        setInCurrency({
          ...inCurrency,
          reserve: token0Reserve,
        });

        setOutCurrency({
          ...outCurrency,
          reserve: token1Reserve,
        });
      } catch (error) {
        console.error("Error fetching reserves:", error);
      }
    };

    fetchReserves();
  }, [client]);

  useEffect(() => {
    // check if the user has approved the router to spend tokens and approve if not
    const assertHasAllowance = async () => {
      if (!client) {
        return;
      }

      try {
        const allowance = (await client.readContract({
          address: inCurrency.address as Address,
          abi: UNISWAP_V2_PAIR_ABI,
          functionName: "allowance",
          args: [account, SEPOLIA_DATA.contracts["UNISWAP_ROUTER"].address],
        })) as bigint;

        if (allowance <= 0n) {
          await client.writeContract({
            account: account as Address,
            address: inCurrency.address as Address,
            abi: UNISWAP_V2_PAIR_ABI,
            functionName: "approve",
            args: [SEPOLIA_DATA.contracts["UNISWAP_ROUTER"].address, maxUint256],
            chain: SEPOLIA_DATA?.chain,
          });
        }
      } catch (error) {
        console.error("Error getting allowance:", error);
      }
    };

    assertHasAllowance();
  }, [client]);

  const executeSwap = async () => {
    if (!client) {
      return;
    }

    const amountIn = parseUnits(inCurrency.amount!.toString(), inCurrency.decimals);
    const amountOut = parseUnits(outCurrency.amount!.toString(), outCurrency.decimals);
    const path = [inCurrency.address, outCurrency.address];

    // expires in 20 minutes
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    if (isInCurrency) {
      await swapTokenForExactToken(amountIn, amountOut, path, deadline);
    } else {
      await swapExactTokenForToken(amountIn, amountOut, path, deadline);
    }
  };

  const switchTokens = () => {
    const temp = outCurrency;
    setOutCurrency(inCurrency);
    setInCurrency(temp);
  };

  const getExactTokenForTokenAmount = (newInAmount: string) => {
    if (!newInAmount || !inCurrency.reserve || !outCurrency.reserve) {
      return 0;
    }

    const parsedAmountIn = parseUnits(newInAmount, inCurrency.decimals);

    const numerator = parsedAmountIn * 997n * outCurrency.reserve;
    const denominator = inCurrency.reserve * 1000n + parsedAmountIn * 997n;
    const amountOut = numerator / denominator;

    if (amountOut > outCurrency.reserve) {
      return null;
    }

    return formatUnits(amountOut, outCurrency.decimals);
  };

  const getTokenForExactTokenAmount = (newOutAmount: string) => {
    if (!newOutAmount || !inCurrency.reserve || !outCurrency.reserve) {
      return 0;
    }

    const parsedAmountOut = parseUnits(newOutAmount, outCurrency.decimals);

    const numerator = inCurrency.reserve * parsedAmountOut * 1000n;
    const denominator = outCurrency.reserve * 997n;
    const amountIn = numerator / denominator + 1n;

    if (amountIn > inCurrency.reserve) {
      return null;
    }

    return formatUnits(amountIn, inCurrency.decimals);
  };

  const swapExactTokenForToken = async (amountIn: bigint, amountOut: bigint, path: string[], deadline: number) => {
    const slippageReduction = (amountOut * SLIPPAGE_IN_PERCENT) / BigInt(100);
    const amountOutMin = amountOut - slippageReduction;

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
      })
      .catch((error) => {
        console.error("Error swapping tokens:", error);
        enqueueSnackbar("Swap failed", { variant: "error" });
      });
  };

  const swapTokenForExactToken = async (amountIn: bigint, amountOut: bigint, path: string[], deadline: number) => {
    const slippageExcedent = (amountIn * SLIPPAGE_IN_PERCENT) / BigInt(100);
    const amountInMax = amountIn + slippageExcedent;

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
      })
      .catch((error) => {
        console.error("Error swapping tokens:", error);
        enqueueSnackbar("Swap failed", { variant: "error" });
      });
  };

  const handleInInputChange = (e: any) => {
    const exactTokenForTokenAmount = getExactTokenForTokenAmount(cleanNumericString(e.target.value));

    if (exactTokenForTokenAmount === null) {
      console.log("exactTokenForTokenAmount is null");
      return;
    }

    setIsInCurrency(true);

    setInCurrency({
      ...inCurrency,
      amount: e.target.value,
    });

    setOutCurrency({
      ...outCurrency,
      amount: exactTokenForTokenAmount ? exactTokenForTokenAmount.toString() : "",
    });
  };

  const handleOutInputChange = (e: any) => {
    const tokenForExactTokenAmount = getTokenForExactTokenAmount(cleanNumericString(e.target.value));

    if (tokenForExactTokenAmount === null) {
      console.log("tokenForExactTokenAmount is null");
      return;
    }

    setIsInCurrency(false);

    setOutCurrency({
      ...outCurrency,
      amount: e.target.value,
    });

    setInCurrency({
      ...inCurrency,
      amount: tokenForExactTokenAmount ? tokenForExactTokenAmount.toString() : "",
    });
  };

  const renderCurrencyInputField = (
    currency: CurrencyData,
    handleInputChange: (e: any) => void,
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
              inputComponent: NumericFormatCustom,
              inputProps: {
                decimalScale: currency.name === "BUSD" ? 2 : 8,
              },
            },
          }}
        />
        {withMaxButton && (
          <Button
            variant="text"
            onClick={() => {
              handleInputChange({
                target: {
                  value: formatUnits(BigInt(balances[currency.name as keyof typeof balances]), currency.decimals),
                },
              });
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
      >
        <Box>
          <Typography mt={1} mb={2} variant="body1" color="textSecondary">
            Swap
          </Typography>

          <Box display="flex" flexDirection="column">
            {renderCurrencyInputField(inCurrency, handleInInputChange, true)}

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

            {renderCurrencyInputField(outCurrency, handleOutInputChange)}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={executeSwap}
              style={{ marginTop: 20, borderRadius: 6 }}
              disabled={!inCurrency.amount || !outCurrency.amount}
            >
              Swap
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
