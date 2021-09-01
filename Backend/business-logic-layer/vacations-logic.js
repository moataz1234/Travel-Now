
const dal = require("../data-access-layer/dal");
const path = require("path");
const uuid = require("uuid");
const { deleteFile } = require("../helpers/file-helper");


async function getAllVacationsAsync() {
    const sql = `SELECT vacationId, description, destination, price,
        DATE_FORMAT(start,"%Y-%m-%d") as start,
        DATE_FORMAT(end,"%Y-%m-%d")as end,
        picture FROM vacations`;

    const vacations = await dal.executeAsync(sql);
    return vacations;
}

async function getOneVacationAsync(vacationId) {
    const sql = `SELECT vacationId, description, destination, price,
        DATE_FORMAT(start,"%Y-%m-%d") as start,
        DATE_FORMAT(end,"%Y-%m-%d")as end,
        picture FROM vacations WHERE vacationId = ${vacationId}`;
    const vacation = await dal.executeAsync(sql);
    return vacation;
}

async function addVacationAsync(vacation, image) {
    if (!image) return null;
    const extension = image.name.substr(image.name.lastIndexOf("."));
    const newImageName = uuid.v4() + extension;
    vacation.picture = newImageName;

    const sql = `INSERT INTO vacations VALUES(DEFAULT, ?, ?, ?, ?, ?, ?)`;
    const info = await dal.executeAsync(sql, [vacation.description, vacation.destination, vacation.price, vacation.start, vacation.end, vacation.picture]);
    vacation.vacationId = info.insertId;
    const fullPath = path.join("./images/", vacation.picture);
    await image.mv(fullPath);
    return vacation;
}


async function updateFullVacationAsync(vacation, newImage, currentImage) {
    if (!newImage) {
        vacation.picture = currentImage;
    }
    else {
        let fullPath = path.join("./images/", currentImageName);
        deleteFile(fullPath);
        const extension = newImage.name.substr(newImage.name.lastIndexOf("."));
        const newFileName = uuid.v4() + extension;
        vacation.picture = newFileName;
        fullPath = path.join("./images/", vacation.picture);
        await newImage.mv(fullPath);
    }

    const sql = `UPDATE vacations SET description = '${vacation.description}',
            destination = '${vacation.destination}', price = '${vacation.price}',
            start = '${vacation.start}', end = '${vacation.end}', picture = '${vacation.picture}'
            WHERE vacationId = ${vacation.vacationId}`;

    const info = await dal.executeAsync(sql);

    return info.affectedRows === 0 ? null : vacation;
}

// // Update partially :
// async function updatePartialVacationAsync(vacation) {
//     console.log(vacation.vacationId);
//     const vacationToUpdate = await getOneVacationAsync(vacation.vacationId);
//     if(!vacationToUpdate) return null;

//     // Update only the properties sent by frontend:
//     for(const prop in vacation) {
//         if(prop in vacationToUpdate && vacation[prop] !== undefined) {
//             vacationToUpdate[prop] = vacation[prop];
//         }
//     }
//     console.log("id in part: " + vacationToUpdate.vacationId)


//     return await updateFullVacationAsync(vacationToUpdate);
// }

// Delete :
async function deleteVacationAsync(vacationId, imageName) {
    const sql = `DELETE FROM vacations WHERE vacationId = '${vacationId}'`;
    const info = await dal.executeAsync(sql);
    const fullPath = path.join("./images/", imageName);
    deleteFile(fullPath);
    return info.affectedRows === 1;
}

module.exports = {
    getAllVacationsAsync,
    getOneVacationAsync,
    addVacationAsync,
    updateFullVacationAsync,
    deleteVacationAsync
}

