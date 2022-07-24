import mongoose from "mongoose";


const surveySchema = mongoose.Schema({
    location: {
        type: String,
        required: true
    },
    titleDeed: {
        type: Object,
        require: true,
    },
    kraPin: {
        type: Object,
        require: true
    },
    permanentAddress: {
        type: String,
        require: true,
    }

},
    {
        timestamps: true

    }
);



const Survey = mongoose.model("Survey", surveySchema);

export default Survey