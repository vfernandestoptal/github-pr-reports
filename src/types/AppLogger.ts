interface LogMethod {
    (message: string): void;
}

export default interface AppLogger {
    error: LogMethod;
    warn: LogMethod;
    info: LogMethod;
    debug: LogMethod;
}
