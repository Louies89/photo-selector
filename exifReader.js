var argv = require('minimist-lite')(process.argv.slice(2));
var ExifImage = require('exif').ExifImage;
const fs = require('fs');
const path = require("path");

const photoTag = 'lui';
const photoesDirectory =[
    { small: "F:/LuiPapu-Wedding-Photo/Lui, Papu's Wedding/24-01-2023/Photo", large: "" },
    { small: "F:/LuiPapu-Wedding-Photo/Lui, Papu's Wedding/25-01-2023/Photo", large: "" },,
    { small: "F:/LuiPapu-Wedding-Photo/Lui, Papu's Wedding/29-01-2023/Photos/1", large: "" },
    { small: "F:/LuiPapu-Wedding-Photo/Lui, Papu's Wedding/29-01-2023/Photos/2", large: "" },
    { small: "F:/LuiPapu-Wedding-Photo/Lui, Papu's Wedding/Pre-wedding/2 nd pre-wedding", large: "" },
]

const imageFileList = []
const selectedImageFileList = []

function listPrepared(){

    const folderPath = path.join(...photoesDirectory[argv.i].small.split('/').slice(3));
    const fileName = folderPath.replace(new RegExp('\\' + path.sep, 'g'), '-');
    fs.writeFileSync(`${fileName}-${photoTag}.txt`, [ photoesDirectory[argv.i].small, ...selectedImageFileList ].join('\n'));
}

function getExifInfo(index) {
    try {
        var exif = new ExifImage();
        exif.loadImage(imageFileList[index], (error, data)=> {
            if((data.image.ImageDescription || '').toLocaleLowerCase().trim().startsWith(photoTag)) {
                const fileName = path.basename(imageFileList[index]);
                selectedImageFileList.push(fileName)
                const folderName = path.join(...photoesDirectory[argv.i].small.split('/').slice(3));
                const destinationFolderName = folderName.replace(new RegExp('\\' + path.sep, 'g'), '-');
                fs.copyFile(`${photoesDirectory[argv.i].large}/${fileName}`, `Selected/${destinationFolderName}/${fileName}`, (err) => {
                    if (err) throw err;
                    console.log('source.txt was copied to destination.txt');
                });
            }
            const nextIndex = index + 1;
            if(nextIndex < imageFileList.length) {
                getExifInfo(nextIndex)
            } else {
                listPrepared()
            }
        });
    } catch (error) {
        console.log('Error: ' + error.message);
    }   
}

async function getImangeList(index) {
    try {
        const fileList = await fs.promises.readdir(path.normalize(photoesDirectory[index].small))
        for(let i=0; i< fileList.length; i++){
            const fileName = fileList[i].toLocaleLowerCase();
            if(fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
                imageFileList.push(path.join(photoesDirectory[index].small, fileList[i])); // List all the jpeg files present in the folder
            }
        }
        const folderName = path.join(...photoesDirectory[argv.i].small.split('/').slice(3));
        const destinationFolderName = folderName.replace(new RegExp('\\' + path.sep, 'g'), '-');
        if (!fs.existsSync(`Selected/${destinationFolderName}`)){
            fs.mkdirSync(`${__dirname}/Selected/${destinationFolderName}`, {recursive: true});
        }
        getExifInfo(0) // check each image tag and find out the selected ones
    } catch (error) {
        console.log('Error: ' + error.message);
    }
}


getImangeList(argv.i);
