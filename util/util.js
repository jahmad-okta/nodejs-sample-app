const createConfig = (url, token, method) => {
    var config = {
        method: method,
        url: url,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    };

    return config
};

exports.createConfig = createConfig;