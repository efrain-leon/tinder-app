export const serverConfig = {
  TOKEN_SECRET: process.env.TOKEN_SECRET || "secretTokenForDevelopment",
  STATIC_FILES: "./public/files",
  DOMAIN: process.env.DOMAIN || "http://localhost:3010",
  filePath: `${__dirname}/../../public/files`,
  publicPath: `${__dirname}/../../public`,  
};
