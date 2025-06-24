async function main() {


    let bankValue = await fetchBankValue();
    console.log(bankValue)
    document.querySelector("#balanceBox").innerHTML = bankValue;



    async function fetchBankValue() {
        // const body = {
        //     "email": "string",
        //     "password": "string"
        // }
        // const Login = await axios.post(`http://localhost:5105/api/Casino/User/Login`, body);
        // const token = Login.data.token;
        const token = localStorage.getItem("userID")
        try {
            const userData = await axios.get('http://localhost:5105/api/user/getData', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return Number(userData.data.credits);
        } catch (error) {
            console.log("Fehler beim Laden des Bankwerts: ", error);
            return 0;
        }
    }

    async function updateBankValue()
    {
        const token = localStorage.getItem("userID")
        
    }
}


main()