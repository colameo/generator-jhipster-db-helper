const chalk = require('chalk');
const generator = require('yeoman-generator');
const dbh = require('../dbh.js');

module.exports = {
    askForTableName,
    askForColumnsName
};

/**
 * Ask the table name for an entity
 */
function askForTableName() {
    let messageAddendum = '';
    let defaultValue = null;

    const validateTableName = dbh.validateTableName;

    if (this.tableNameDBH !== undefined) {
        messageAddendum = `(currently : ${this.tableNameDBH})`;
        defaultValue = this.tableNameDBH;
    } else {
        defaultValue = this.entityTableName;
    }

    const done = this.async();
    this.prompt([
        {
            type: 'input',
            name: 'tableNameDBH',
            validate: input => validateTableName(input),
            message: 'What is the table name for this entity ?' + messageAddendum,
            default: defaultValue
        }
    ]).then((props) => {
        this.tableNameInput = props.tableNameDBH;
        done();
    });
}

/** For each field of an entity, ask the actual column name */
function askForColumnsName() {
    // Don't ask columns name if there aren't any field
    if (this.fields === undefined || this.fields.length === 0) {
        return;
    }

    this.log(chalk.green(`Asking column names for ${this.fields.length} field(s)`));
    const done = this.async();

    // work on a copy
    this.fieldsPile = this.fields.slice();
    // feed the first item for the first question
    this.field = this.fieldsPile.pop();
    askForColumnName.call(this, done);
}

/**
 * Use ${this.field} which is set either by askForColumnsName or previous recursive call
 *
 * Ask the column name for the field of an entity
 * This function use ${this.fieldsPile}, at each call it will pop an item from it and ask its question about it.
 * Then it will associate the answer with this item and push it to ${this.columnsInput}.
 * So at the end of the recursion, ${this.fieldsPile} will be empty and this.columnsInput full with what was in the former.
 **/
function askForColumnName(done) {
    let messageAddendum = '';
    let defaultValue = null;

    const validateColumnName = dbh.validateColumnName;

    if (this.field.columnNameDBH !== undefined) {
        messageAddendum = `(currently : ${this.field.columnNameDBH})`;
        defaultValue = this.field.columnNameDBH;
    } else {
        defaultValue = this.field.fieldName;
    }

	// TODO check if the column field has already been added to this.fields
	// TODO display current field AND if present column name when asking for a new column name
	// TODO set default as column name value
    const prompts = [
        {
            type: 'input',
            name: 'columnNameDBH',
            validate: input => validateColumnName(input),
            message: `What column name do you want for the field "${this.field.fieldName}" ? ${messageAddendum}`,
            default: defaultValue
        }
    ];

    this.prompt(prompts).then((props) => {
        this.field.columnNameInput = props.columnNameDBH;

        // push just processed item
        this.columnsInput.push(this.field);
        // pop item for next recursion
        this.field = this.fieldsPile.pop();

        if (this.field !== undefined) {
            askForColumnName.call(this, done);
        } else {
            done();
        }
    });
}

