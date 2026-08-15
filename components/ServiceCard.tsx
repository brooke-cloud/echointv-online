type ServiceCardProps = {
    title: string;
    description: string;
};


export default function ServiceCard({
    title,
    description
}: ServiceCardProps) {


    return (

        <div
            className="
                p-6
                border
                rounded-xl
                shadow-sm
                hover:shadow-lg
                transition
            "
        >


            <h3
                className="
                    text-2xl
                    font-bold
                    text-blue-400
                "
            >

                {title}

            </h3>



            <p
                className="
                    mt-4
                    text-gray-600
                "
            >

                {description}

            </p>



        </div>

    );

}