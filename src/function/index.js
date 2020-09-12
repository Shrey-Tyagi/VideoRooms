import { Dimensions, PixelRatio } from 'react-native';

export const fontCustomSize = (size) => {
    const newSize = size * (Dimensions.get("window").width / 320)
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
}