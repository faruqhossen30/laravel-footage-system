import useDarkSide from "@/Hook/useDarkSide";
import { useState } from "react";
import { DarkModeSwitch } from "react-toggle-dark-mode";

export default function Switcher() {
	const [colorTheme, setTheme] = useDarkSide();
	const [darkSide, setDarkSide] = useState(
		colorTheme === "light" ? true : false
	);

	const toggleDarkMode = (checked) => {
		setTheme(colorTheme);
		setDarkSide(checked);
	};

	return (
		<>
			<DarkModeSwitch
				style={{ display: "inline" }}
				checked={darkSide}
				onChange={toggleDarkMode}
				size={20}
                sunColor={'grey'}
                moonColor={'grey'}
			/>
		</>
	);
}
