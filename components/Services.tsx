import ServiceCard from "./ServiceCard";


const services = [

    {
        title:"Mock Interview",
        description:"Practice with real interview questions."
    },


    {
        title:"Resume Review",
        description:"Improve your resume for top tech companies."
    },


    {
        title:"Coding Coaching",
        description:"Master coding interviews step by step."
    }

];



export default function Services(){


    return (

        <section
            className="
                py-20
                bg-white
            "
        >
            <div
                className="
                    max-w-7xl
                    mx-auto
                    px-6
                "
            >

                <h2
                    className="
                        text-4xl
                        font-bold
                        text-center
                        text-blue-600
                    "
                >

                    Our Services

                </h2>



                <div
                    className="
                        mt-12
                        grid
                        grid-cols-3
                        gap-8
                        px-10
                    "
                >


                    {
                        services.map((service)=>(
                            
                            <ServiceCard
                                key={service.title}
                                
                                title={service.title}

                                description={service.description}

                            />

                        ))
                    }


                </div>
            </div>


        </section>

    );

}