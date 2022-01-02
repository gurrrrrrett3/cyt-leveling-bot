import fs from 'fs';
export default function checkForDbs (): void {

    const doesLocalDbExist = fs.existsSync('./data/localdb.json');
    const doesReactDbExist = fs.existsSync('./data/reactdb.json');

    if (!doesLocalDbExist) {
        fs.writeFileSync('./data/localdb.json', JSON.stringify({update: [], insert: [], users: []}));
    }

    if (!doesReactDbExist) {
        fs.writeFileSync('./data/reactdb.json', JSON.stringify([]));
    }

}