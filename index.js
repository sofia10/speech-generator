import axios from "axios";

class TextToSpeechGenerator {
    text;
    onresult;

    start() {
        this.validate();

        this.request(
            this.getSentences()
        );
    }

    validate() {
        if (!this.text || !this.onresult) throw new Error("Text or callback not specified");
    }

    getSentences() {
        const delimiters = ['.', '!', '?', ';', ','];
        const isLongText = this.text.length > 150;

        if (!isLongText) return [this.text];

        function onlyUnique(value, index, array) {
            return array.indexOf(value) === index;
        }

        const splitDelimiters = this.text.slice(150, 230).split('').filter((char) => delimiters.indexOf(char) !== -1).filter(onlyUnique);

        let result = [this.text];

        for (const delimiter of splitDelimiters) {
            result = result.map((part) => part.split(delimiter).map(item => item.trim())).flat().filter((item) => item);
        }

        return result;
    }

    async request(sentences) {
        const API_ENDPOINT = "https://enagramm.com/API/TTS/SynthesizeTextAudioPath";
        const token = await this.getAccessToken();

        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i];

            try {
                const response = await axios.post(API_ENDPOINT, {
                    Language: 'ka',
                    Text: sentence,
                    Voice: 0,
                    IterationCount: i,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                this.onresult(response.data.AudioFilePath);
            } catch (e) {
                console.error(`Failed to generate sentence: ${sentence}`);
            }

        }
    }

    async getAccessToken() {
        const credentials = { Email: "levan.lashauri1@gmail.com", Password: "Demo_1234" }

        const response = await axios.post("https://enagramm.com/API/Account/Login", credentials);

        return response.data.AccessToken;
    }
}

const generator = new TextToSpeechGenerator();
generator.text = "გრძელი ტექსტი დასამუშავებლად. სასვენი, ნიშნებით და სხვა სიმბოლოებით, გრძელი ტექსტი დასამუშავებლად. სასვენი, ნიშნებით და სხვა სიმბოლოებით. გრძელი ტექსტი დასამუშავებლად. სასვენი, ნიშნებით და სხვა სიმბოლოებით, გრძელი ტექსტი დასამუშავებლად. სასვენი, ნიშნებით და სხვა სიმბოლოებით";
generator.onresult = (path) => console.log(path);
generator.start();