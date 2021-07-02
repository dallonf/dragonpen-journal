import "@emotion/react";
import { Theme as MuiTheme } from "@material-ui/core/styles";

declare module "@emotion/react" {
  interface Theme extends MuiTheme {}
}
