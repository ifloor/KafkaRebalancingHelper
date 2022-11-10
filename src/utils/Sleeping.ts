export class Sleeping {
    public static sleep(ms: number) {
        return new Promise((f) => setTimeout(f, ms));
    }
}
