export class Parser {
    constructor () {
        this.commands = new Map();
        this.commands.set("create", /^\s*create\s+table\s+(\w+)\s*\(([\w\s,]+)\)/);
        this.commands.set("insert", /^\s*insert\s+into\s+(\w+)\s*\(([\w\s,]+)\)\svalues\s\(([\w\s,]+)\)/);
        this.commands.set("select", /^\s*select\s+(.+)\s+from\s([a-z]+)(?: where (.+))?/);
        this.commands.set("delete", /^\s*delete\s+from\s([a-z]+)(?: where\s+(.+))?/);
    };
    parse(statement) {
        for(let [command, regex] of this.commands) {
            let parsedStatement = regex.exec(statement);
            if (parsedStatement) { 
                return { command, 
                    parsedStatement 
                }
            };
        };
    };
};
