import { toHash } from "./hash";

export function generateColor(text: string): string {
    return (
        parseInt(
            parseInt(toHash(text), 36)
                .toExponential()
                .slice(2, -5)
            , 10) & 0xFFFFFF
    ).toString(16).toUpperCase();
}