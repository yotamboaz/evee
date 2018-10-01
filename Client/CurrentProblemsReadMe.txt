Current Problems:
1. Event details are open on click only after moving to another screen (For example: click on 'Around Me' button and than on 'Board')
2. Map is not displayed while clicking on 'Around Me' button
3. Top menu tab component doesn't work on another file.
	- Component name is 'MapDisplay'.
	- It should be used for example on line 162 in 'EventsBoard.js' instead the whole returned value on aroundMeMode() function.
	- Notice that it works only without passing the events as a prop.