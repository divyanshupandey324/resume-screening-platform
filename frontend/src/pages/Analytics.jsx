import {

    useEffect,

    useState

}
from "react";

import Sidebar
from "../components/Sidebar";

import API
from "../services/api";

export default function Analytics(){

    const [

        analytics,

        setAnalytics

    ] = useState({});

    useEffect(()=>{

        fetchAnalytics();

    },[]);

    const fetchAnalytics=
    async()=>{

        try{

            const response=
            await API.get(
                "/analytics"
            );

            setAnalytics(
                response.data
            );

        }

        catch(error){

            console.log(error);

        }

    };

    return(

        <div
            className="dashboard"
        >

            <Sidebar/>

            <div
                className="content"
            >

                <h1>
                    Analytics
                </h1>

                <br/>

                <div
                    className=
                    "glass-card"
                >

                    <h2>
                    Total Candidates
                    </h2>

                    <h1>

                    {
                    analytics
                    .total_candidates
                    }

                    </h1>

                </div>

                <br/>

                <div
                    className=
                    "glass-card"
                >

                    <h2>
                    Shortlisted
                    </h2>

                    <h1>

                    {
                    analytics
                    .shortlisted
                    }

                    </h1>

                </div>

                <br/>

                <div
                    className=
                    "glass-card"
                >

                    <h2>
                    Rejected
                    </h2>

                    <h1>

                    {
                    analytics
                    .rejected
                    }

                    </h1>

                </div>

            </div>

        </div>

    )

}