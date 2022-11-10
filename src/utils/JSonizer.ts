export class JSonizer {

    public static toJSonWithoutCircularRefs(object: any): string {
        return JSON.stringify(object, getCircularReplacer());
    }
}

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key: any, value: any) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};
