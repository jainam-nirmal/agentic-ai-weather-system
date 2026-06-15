import chalk from "chalk";

class Logger {

    static info(message) {
        console.log(chalk.blue(message));
    }

    static error(message) {
        console.log(chalk.red(`[ERROR] ${message}`));
    }

    static success(message) {
        console.log(chalk.green(message));
    }
}

export default Logger;
