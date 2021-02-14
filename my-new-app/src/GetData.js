import './GetData.css';
import customData from './books.json';


function GetData(props) {
	
	const pathtofile = "./books.json";
	var result = '';

	if( props.name == "Nastya") {
		result = "Hi "+ (props.name)+  "!"
	} else {
		result = "Who are you?"
	}

	return (
		<div className="GetData">
			{result}
		</div>
	)
}


export default GetData;
