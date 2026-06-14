import { useEffect, useState }
from "react";

import Sidebar
from "../components/Sidebar";

import API
from "../services/api";

export default function Rankings(){

    const [

        candidates,

        setCandidates

    ] = useState([]);

    useEffect(()=>{

        fetchCandidates();

    },[]);

    const fetchCandidates = async()=>{

        try{

            const response =
            await API.get(
                "/candidate/rankings"
            );

            setCandidates(
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
                    Candidate Rankings
                </h1>

                <br/>

                <table
                    className=
                    "ranking-table"
                >

                    <thead>

                        <tr>

                            <th>
                                Rank
                            </th>

                            <th>
                                Name
                            </th>

                            <th>
                                Score
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                        candidates.map(

                        (
                        candidate,
                        index
                        )=>(

                            <tr
                            key={index}
                            >

                                <td>
                                {index+1}
                                </td>

                                <td>
                                {
                                candidate.name
                                }
                                </td>

                                <td>
                                {
                                candidate.score
                                }%
                                </td>

                            </tr>

                        )

                        )

                        }

                    </tbody>

                </table>

            </div>

        </div>

    )

}