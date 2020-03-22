/**
 * Base PassImages class to add image filePath manipulation
 */

const { basename, extname, resolve } = require('path');
const File = require('fs');

// Supported images.
const { IMAGES, DENSITIES } = require('../constants');

const SUPPORTED_IMAGES = [ "background", "footer", "icon", "logo", "strip", "thumbnail" ];


class PassImages {
  constructor() {
    // Creating this way to make it invisible
    this.map = new Map();

    // define setters and getters for particular images
    for (const imageType in IMAGES) {
      Object.defineProperty(this, imageType, {
        enumerable: false,
        get: this.getImage.bind(this, imageType),
        set: this.setImage.bind(this, imageType, '1x'),
      });
      // setting retina properties too
      for (const density of DENSITIES) {
        Object.defineProperty(this, imageType + density, {
          enumerable: false,
          get: this.getImage.bind(this, imageType, density),
          set: this.setImage.bind(this, imageType, density),
        });
      }
    }

    Object.preventExtensions(this);
  }

  /**
   * Returns a given imageType path with a density
   *
   * @param {string} imageType
   * @param {string} density - can be '2x' or '3x'
   * @returns {string} - image path
   * @memberof PassImages
   */
  getImage(imageType, density = '1x') {
    if (!(imageType in IMAGES))
      throw new Error(`Requested unknown image type: ${imageType}`);
    if (!DENSITIES.includes(density))
      throw new Error(`Invalid desity for "${imageType}": ${density}`);
    if (!this.map.has(imageType)) return undefined;
    return this.map.get(imageType).get(density);
  }

  /**
   * Saves a given imageType path
   *
   * @param {string} imageType
   * @param {string} density
   * @param {string} fileName
   * @memberof PassImages
   */
  setImage(imageType, density = '1x', fileName) {
    console.log(imageType, fileName)
    if (!(imageType in IMAGES))
      throw new Error(`Attempted to set unknown image type: ${imageType}`);
    const imgData = this.map.get(imageType) || new Map();
    imgData.set(density, fileName);
    this.map.set(imageType, imgData);
  }


  loadFromDirectory(path) {
    var self = this;
    var files = File.readdirSync(path);
    files.forEach(function(filename) {
      const basefilename = basename(filename, ".png");
      if (/@2x$/.test(basefilename) && ~SUPPORTED_IMAGES.indexOf(basefilename.slice(0, -3))) {
        // High resolution
        //self.images[basefilename.replace(/@2x$/, "2x")] = resolve(path, filename);
        self.setImage(basefilename.slice(0, -3), '2x', resolve(path, filename));
      } else if (~SUPPORTED_IMAGES.indexOf(basefilename)) {
        // Normal resolution
        //self.images[basefilename] = resolve(path, filename);
        self.setImage(basefilename, '1x', resolve(path, filename));
      }
    });
    return this;
  };


}

module.exports = PassImages;
