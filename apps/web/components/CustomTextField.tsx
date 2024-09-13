import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

const CustomTextField = (props: TextFieldProps) => {
  return (
    <TextField
      {...props}
      sx={{
        ...props.sx,
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          "& fieldset": {
            borderRadius: 2,
          },
        },
      }}
    />
  );
};

export default CustomTextField;
