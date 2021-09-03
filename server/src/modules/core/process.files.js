import _ from 'underscore';
import Q from 'q';
import gm from 'gm';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';

const _gm = gm.subClass({imageMagick: true});

const ProcessFile = (destinationPath) => {

  const processImage = async (dataToProcess, imageProperty) => {
    try {
      if (!dataToProcess[imageProperty] || !dataToProcess[imageProperty].match(/tmp|var/)) {
        return;
      }

      const deferred = Q.defer();

      let imagesDestinationPath = `${destinationPath}/images`;

      const imageFileName = uuidv4() + '.png';
      const target = `${imagesDestinationPath}/${imageFileName}`;

      const pathExists = await fs.pathExists(imagesDestinationPath);

      if (!pathExists) {
        fs.mkdirsSync(imagesDestinationPath);
      }

      _gm(dataToProcess[imageProperty])
      .resize(320, 320)
      .write(target, (err) => {
        if (err) {
          throw err;
        };

        dataToProcess[imageProperty] = imageFileName;
        deferred.resolve();
      });

      return deferred.promise;
    }
    catch (err) {
      throw err;
    }
  };

  return {
    getImages: function(schema) {
      const images = [];

      _.map(schema.tree, (property, propertyName) => {
        if (_.has(property, 'image') && property.image === true){
          images.push(propertyName);
        }
      });

      return images;
    },

    saveImages: async function(schema, dataToProcess) {
      const imageProperties = this.getImages(schema);
      const generatedFiles = [];

      imageProperties.forEach((imageProperty) => {
        generatedFiles.push(processImage(dataToProcess, imageProperty));
      });

      await Q.all(generatedFiles);
      return dataToProcess;
    }
  };
};

export default ProcessFile;