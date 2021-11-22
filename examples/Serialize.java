import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

class AuthenticationMessage {
    @JsonProperty("publicKey")
    private String publicKey;

    @JsonProperty("identity")
    private String identity;

    @JsonProperty("attestation")
    private String attestation;
    // Add other fields necessary

    public String getPublicKey() {
        return publicKey;
    }

    public String getIdentity() {
        return identity;
    }

    public String getAttestation() {
        return attestation;
    }

    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }

    public void setIdentity(String identity) {
        this.identity = identity;
    }

    public void setAttestation(String attestation) {
        this.attestation = attestation;
    }

    public String serializeToString() throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.writeValueAsString(this);
    }

    public byte[] serializeToBytes() throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.writeValueAsBytes(this);
    }
}

// https://stackoverflow.com/questions/9655181/how-to-convert-a-byte-array-to-a-hex-string-in-java

public class Serialize {
    private static final byte[] HEX_ARRAY = "0123456789ABCDEF".getBytes(StandardCharsets.US_ASCII);
    private static String bytesToHex(byte[] bytes) {
        byte[] hexChars = new byte[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = HEX_ARRAY[v >>> 4];
            hexChars[j * 2 + 1] = HEX_ARRAY[v & 0x0F];
        }
        return new String(hexChars, StandardCharsets.UTF_8);
    }
    public static void main(String[] args) throws JsonProcessingException {
        String publicKey = "-----BEGIN PUBLIC KEY-----\\nMCowBQYDK2VwAyEAByjr4f5k+YdfZ4mZsU/fOAqWJE1cKhIzfhoktiK8zAY=\\n-----END PUBLIC KEY-----\\n";
        String identity = "8d5413b8d1d7e4fec772b229bc36e45d084598bcca689d6f0b4f11877c250220";
        String attestation = "DEADBEEF";
        AuthenticationMessage message = new AuthenticationMessage();
        message.setPublicKey(publicKey);
        message.setIdentity(identity);
        message.setAttestation(attestation);

        byte[] messageToSignInBytes = message.serializeToBytes();
        System.out.println("Message to Sign : " + Arrays.toString(messageToSignInBytes));

        String hex = bytesToHex(messageToSignInBytes);

        System.out.println("Message to Sign (hex) : " + hex);
        // Generate the Key
        // Sign the messageToSignInBytes with the PublicKey ...
    }
}
