const AppConstants = () => {
  let host = window.location.origin;

  if (window.location.hostname === 'localhost') {
    host = "http://localhost:3010";
  }

  return {
    host: host,
    apiHost: `${host}/api`,
    
  }
}

export default AppConstants;