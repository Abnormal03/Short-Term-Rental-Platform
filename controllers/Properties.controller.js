const getProperties = (req, res) => {
    try {
        const products = () => {
            // get products
        }

        return res.status(200).json({ products });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "unable to get products." })

    }
}