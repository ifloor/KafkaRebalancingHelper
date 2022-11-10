export class PoweredReplacer {
    public static replaceUntilTheEnd(stringToReplace: string, toReplace: string, replaceWith: string): string {
        let newString = stringToReplace;
        while (newString.includes(toReplace)) {
            newString = newString.replaceAll(toReplace, replaceWith);
        }

        return newString;
    }
}
