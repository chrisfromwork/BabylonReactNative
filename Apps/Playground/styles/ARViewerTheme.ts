export type Theme = {
    mainColor: string;
    textColor: string;
    disabledColor: string;
    disabledTextColor: string;
    disabledBorderColor: string;
    whiteColor: string;
    fontSize: number;
};

// Note, this can change to a React Context in the future to change these properties.
// For now, it is just a const because we want to access these outside of a React component i.e. Styles files
export const ARViewerTheme: Theme = {
    mainColor: "#0078D4",
    textColor: "#FFFFFF",
    disabledColor: "#F8F8F8",
    disabledTextColor: "#767673",
    disabledBorderColor: "#919191",
    whiteColor: "#FFFFFF",
    fontSize: 18
};