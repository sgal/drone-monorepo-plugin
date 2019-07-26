const httpSignature = require("http-signature");

const isEventValid = (event, secret) => {
    const request = {
        ...event,
        headers: {
            ...event.headers,
            signature: `Signature ${event.headers.signature}`
        }
    };
    const parsedSignature = httpSignature.parseRequest(request, {
        authorizationHeaderName: "signature"
    });
    return httpSignature.verifyHMAC(parsedSignature, secret);
};

module.exports = isEventValid;
