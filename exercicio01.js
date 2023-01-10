class DatabaseError { 
    constructor(statement, message) {
        this.statement = statement;
        this.message = message;
    };
};

class Parser {
    constructor (){
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
                return { command, parsedStatement }
            };
        };
    };
};

class Database {

    constructor() {
        this.parser = new Parser();
        this.tables = {};
    };

    create(parsedStatement) {
        const [, tableName, columns] = parsedStatement;
        this.tables = {
            [tableName] : {
                "columns" : {},
                "data" : []
            }
        };
        columns.split(',').forEach(c => {
            let column = c.trim().split(' ');
            let [nome, tipo] = column;
            this.tables[tableName].columns[nome] = tipo;
        });
    };

    insert(parsedStatement) {
        let [, tableName, columns, values] = parsedStatement;
        columns = columns.split(',').map(c => c.trim());
        values = values.split(',').map(v => v.trim());
        let row = {};
        columns.forEach((_, index) => 
            row[columns[index]] = values[index]
        );
        this.tables[tableName].data.push(row);
    };

    select(parsedStatement) {
        let [, columns, tableName, whereClause] = parsedStatement;
        columns = columns.split(',').map(c => c.trim());
        let rows = this.tables[tableName].data;
        if (whereClause) {
            let [columnWhere, valueWhere] = whereClause.split('=').map(w => w.trim()); 
            rows = rows.filter(row => row[columnWhere] === valueWhere);
        }
        rows = rows.map(row => {
            let selectedRow = {};
            columns.forEach(column => {
                selectedRow[column] = row[column];
            });
            return selectedRow;
        });
        return rows;
    };

    delete(parsedStatement) {
        let [, tableName, whereClause] = parsedStatement;
        if (whereClause) {
            let [columnWhere, valueWhere] = whereClause.split('=').map(w => w.trim());
            this.tables[tableName].data = this.tables[tableName].data.filter(row => !(row[columnWhere] === valueWhere));
        } else {
            this.tables[tableName].data = [];
        };
    };

    execute(statement) {
        let result = this.parser.parse(statement);
        if (result) {
           return this[result.command](result.parsedStatement);
        };
        const message = `Syntax error: '${statement}'`;
        throw new DatabaseError(statement, message);
    };
};

try {
    let database = new Database();
    database.execute("create table author (id number, name string, age number, city string, state string, country string)");
    database.execute("insert into author (id, name, age) values (1, Douglas Crockford, 62)");
    database.execute("insert into author (id, name, age) values (2, Linus Torvalds, 47)");
    database.execute("insert into author (id, name, age) values (3, Martin Fowler, 54)");
    database.execute("delete from author where id = 2");
    console.log(JSON.stringify(database.execute("select name, age from author"), undefined, "   "));
} catch (error) {
    console.log(error.message);
}
