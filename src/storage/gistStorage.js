const axios = require('axios');
const logger = require('../utils/logger');

/**
 * GitHub Gist Storage Service
 * 
 * Lagrar och hämtar JSON-data från en GitHub Gist istället för lokala filer.
 * Detta gör att vi kan köra skriptet i GitHub Actions utan att förlora state.
 * 
 * Kräver följande environment variables:
 * - GITHUB_TOKEN: Personal Access Token med 'gist' scope
 * - GIST_ID: ID för den Gist där data lagras (skapas automatiskt om den inte finns)
 */

const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GIST_ID = process.env.GIST_ID;

/**
 * Skapar en ny Gist med tomma data-filer
 * @returns {Promise<string>} Gist ID
 */
const createGist = async () => {
  try {
    logger.info('Creating new Gist for data storage...');
    
    const response = await axios.post(
      `${GITHUB_API}/gists`,
      {
        description: 'StepInNotifier Data Storage',
        public: false, // Privat Gist!
        files: {
          'previousData.json': {
            content: JSON.stringify([], null, 2),
          },
        },
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    const gistId = response.data.id;
    logger.info(`Gist created successfully! GIST_ID: ${gistId}`);
    logger.info('⚠️  Add this GIST_ID to your GitHub Secrets!');
    
    return gistId;
  } catch (error) {
    logger.error(`Failed to create Gist: ${error.message}`);
    throw error;
  }
};

/**
 * Hämtar en fil från Gist
 * @param {string} filename - Namnet på filen (t.ex. 'previousData.json')
 * @returns {Promise<any>} Parsed JSON data
 */
const readFile = async (filename) => {
  try {
    // Om GIST_ID inte finns, skapa en ny Gist
    let gistId = GIST_ID;
    if (!gistId) {
      gistId = await createGist();
      logger.warn(`No GIST_ID found. Created new Gist: ${gistId}`);
      logger.warn('Please add this as GIST_ID in your environment variables!');
    }

    const response = await axios.get(`${GITHUB_API}/gists/${gistId}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const file = response.data.files[filename];
    
    if (!file) {
      logger.warn(`File ${filename} not found in Gist, returning empty array`);
      return [];
    }

    return JSON.parse(file.content);
  } catch (error) {
    logger.error(`Failed to read ${filename} from Gist: ${error.message}`);
    
    // Om Gist inte finns, returnera empty array
    if (error.response && error.response.status === 404) {
      logger.info('Gist not found, returning empty array');
      return [];
    }
    
    throw error;
  }
};

/**
 * Skriver/uppdaterar en fil i Gist
 * @param {string} filename - Namnet på filen
 * @param {any} data - Data att spara (kommer JSON.stringify:as)
 */
const writeFile = async (filename, data) => {
  try {
    // Om GIST_ID inte finns, skapa en ny Gist
    let gistId = GIST_ID;
    if (!gistId) {
      gistId = await createGist();
      logger.warn(`No GIST_ID found. Created new Gist: ${gistId}`);
      logger.warn('Please add this as GIST_ID in your environment variables!');
    }

    await axios.patch(
      `${GITHUB_API}/gists/${gistId}`,
      {
        files: {
          [filename]: {
            content: JSON.stringify(data, null, 2),
          },
        },
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    logger.info(`Successfully updated ${filename} in Gist`);
  } catch (error) {
    logger.error(`Failed to write ${filename} to Gist: ${error.message}`);
    throw error;
  }
};

/**
 * Kontrollerar om en fil finns i Gist
 * @param {string} filename - Namnet på filen
 * @returns {Promise<boolean>}
 */
const fileExists = async (filename) => {
  try {
    if (!GIST_ID) return false;

    const response = await axios.get(`${GITHUB_API}/gists/${GIST_ID}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    return !!response.data.files[filename];
  } catch (error) {
    return false;
  }
};

module.exports = {
  readFile,
  writeFile,
  fileExists,
};
