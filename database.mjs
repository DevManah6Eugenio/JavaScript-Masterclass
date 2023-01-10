import { Parser } from "./parser.mjs";
import { DatabaseError } from "./databaseError.mjs";

export class Database {

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
