const encoder = new TextEncoder();  // UTF-8 is the charset we will be using for the bytes
const decoder = new TextDecoder();

interface IRegisterRequest {
    publicKey: string  // in hex
    message: Buffer
    sigMessage: string
}

interface IRegisterMessage {
    publicKey: string   // in hex
    identity: string    // in hex
    attestation: string // in hex
}

// Class to deserialize authentication message from JAva
class AuthenticationMessage {
    publicKey: string
    identity: string
    attestation: string
    constructor(BufferbytesFromJava:  any) {
        // 1. Convert the byte stream into a UInt8Array i.e. each byte represented as 8 bits
        let buffer = new Uint8Array(BufferbytesFromJava);
        // 2. Use the UTF-8 Text decoder on the buffer to obtain the serialized contents from Java
        let serializedContents = decoder.decode(buffer);
        // 3. Let Java encode the messages exposing Java struct as JSON.
        let contents:IRegisterMessage = JSON.parse(serializedContents);
        // 4. Parse the fields correctly to match the Java class
        this.publicKey = contents['publicKey'];
        this.identity = contents['identity'];
        this.attestation = contents['attestation'];
    }
}
/*
SAMPLE REQUEST
{
    "private_key": "-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEIJXFkSvtzIKp+qWEA7nOBgkhQ5h8eXg7y0xXDA/raI+z\n-----END PRIVATE KEY-----\n",
    "public_key": "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAhvzcL0H2fzEziXL673OppEZniNWYind4ovHrN0QSUxU=\n-----END PUBLIC KEY-----\n",
    "identity": "8d5413b8d1d7e4fec772b229bc36e45d084598bcca689d6f0b4f11877c250220"
}

 [123, 34, 112, 117, 98, 108, 105, 99, 75, 101, 121, 34, 58, 34, 68, 69, 65, 68, 66, 69, 69, 70, 34, 44, 34, 105, 100, 101, 110, 116, 105, 116, 121, 34, 58, 34, 56, 100, 53, 52, 49, 51, 98, 56, 100, 49, 100, 55, 101, 52, 102, 101, 99, 55, 55, 50, 98, 50, 50, 57, 98, 99, 51, 54, 101, 52, 53, 100, 48, 56, 52, 53, 57, 56, 98, 99, 99, 97, 54, 56, 57, 100, 54, 102, 48, 98, 52, 102, 49, 49, 56, 55, 55, 99, 50, 53, 48, 50, 50, 48, 34, 44, 34, 97, 116, 116, 101, 115, 116, 97, 116, 105, 111, 110, 34, 58, 110, 117, 108, 108, 125]
*/
export { IRegisterRequest, AuthenticationMessage }
