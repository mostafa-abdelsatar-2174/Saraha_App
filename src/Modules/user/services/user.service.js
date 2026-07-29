export const getProfile = async (req, res, next)=>{
    try {
        const theUser = req.user
        return res.status(200).json({message:"DONE", You:theUser})
    } catch (error) {
        return res.status(500).json({message:"server error", name:error.name, errorStack:error.stack})
    }
}
