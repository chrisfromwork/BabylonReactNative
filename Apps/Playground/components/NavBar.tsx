import * as React from "react";
import { FunctionComponent, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import { FontStyle, IconFontStyle } from "../styles/FontStyles";
import { ARViewerTheme } from "../styles/ARViewerTheme";

const styles = StyleSheet.create({
    bar: {
        padding: 8,
        backgroundColor: ARViewerTheme.mainColor,
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent: "center",
        zIndex: 2
    },
    buttonText: {
        color: ARViewerTheme.textColor,
        textAlign: "center",
        alignSelf: "center",
        marginHorizontal: 4,
        ...FontStyle.normal
    },
    icon: {
        alignSelf: "center",
        marginHorizontal: 4,
        color: ARViewerTheme.textColor
    },
    buttonStyle: {
        justifyContent: "center",
        alignContent: "center",
        flexDirection: "row",
        // If we want the NavBar to be bigger, make the buttons bigger with this prop, otherwise it is auto sized
        height: 30
    }
});

// Wrap the native props to provide a better interface and hide the native details.
export interface NavBarProps {
    backClickHandler: () => void;
    resetClickHandler: () => void;
}

// Wrap the native component to provide a better interface and hide the native details.
export const NavBar: FunctionComponent<NavBarProps> = (props: NavBarProps) => {

    return (
        <View style={styles.bar}>
            <TouchableOpacity
                onPress={props.backClickHandler}
                style={styles.buttonStyle}>
                <Text style={styles.buttonText}>{"Enter/Exit AR"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={props.resetClickHandler}
                style={styles.buttonStyle}>
                <Text style={styles.buttonText}>{"Reset"}</Text>
            </TouchableOpacity>
        </View>
    );
};