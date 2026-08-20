import React from 'react'

const HelpPage = () => {
  return (
    <div>
        <h1> How to use: </h1>

        <b> Going to next row </b>
        <br>
        </br>
        You can go to the next row at any time by pressing the enter key when you are in a stitch.
        <br>
        </br>
        <br>
        </br>

        <b> Going to a previous row/undoing changes </b>
        <br>
        </br>
        You can go to a <i>previous row</i> by clicking into a stitch of said row and pressing enter. 
        Going back <b>WILL</b> undo all changes made up to the end of that row you went back to.
        <br>
        </br>
        <br>
        </br>

        <b> Project notes </b>
        <br>
        </br>
        You can add context to your project in the project notes section. If you hover over the bottom right
        corner of the text box, you can resize the notes vertically for more/less space.
        <br>
        </br>
        <br>
        </br>

        <b> Highlighting </b>
        <br>
        </br>
        You can color stitches using the highlight feature. The symbol next to the highlight color enables highlighting.
        The check mark means whatever color is appearing in the textbox will be used to highlight. clicking on the symbol to
        change it to an x means that there will be no highlighting at all. 
        <br>
        </br>
        <br>
        </br>

        <b> Autocomplete </b>
        <br>
        </br>
        You can autocomplete stitches by typing in a pattern in the textbox, separated by spaces, and pressing tab. 
        For example: k p k p k pw ill autocomplete 6 stitch boxes. You can also do brk k brk k to have stitches with 
        more than one letter in them in the stitch box.  
        <br>
        </br>
        <br>
        </br>
        Autocomplete is also used alongside the highlight feature. When you use autocomplete, the highlighted color,
        if highlighting is turned on, will be used for each stitch.

        <br>
        </br>
        <br>
        </br>

        <b> Saving a project </b>
        <br>
        </br>
        Each time you make a change to the project, you will be notified that the project has unsaved changes. 
        The project is NEVER saved automatically, so make sure to press Save project to save the current state of your project.  
        <br>
        </br>
        <br>
        </br>

    </div>
  )
}

export default HelpPage