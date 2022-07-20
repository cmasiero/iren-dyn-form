exports.menu = (menuExtra) => {

    let extraPart = {declare : "", show: "", hide: ""};
    if (menuExtra !== undefined) {
        let token = menuExtra.map((me) => {
            let o = {
                declare: `let ${me.id} = document.getElementById("${me.id}");`,
                show: `${me.id}.style.display = "block";`,
                hide: `${me.id}.style.display = "none";`
            }
            return o;
        });

        extraPart.declare = token.map((t) => {
            return t.declare;
        }).join("\n");

        extraPart.show = token.map((t) => {
            return t.show;
        }).join("\n");

        extraPart.hide = token.map((t) => {
            return t.hide;
        }).join("\n");

    } 

    return `
                let toggleMenu = false;
                document.getElementById("buttonToggle").addEventListener("click", () => {
                    let butToggle = document.getElementById("buttonToggle");
                    let butIds = document.querySelectorAll("#buttonSend, #buttonClear, #buttonSave, #buttonRecap");
                    ${extraPart.declare}
                    toggleMenu = !toggleMenu;
                    if (toggleMenu) {
                        butToggle.style['background-color'] = "#cccc00";
                        butIds.forEach( b => b.style.display = "block");
                        ${extraPart.show}
                    } else {
                        butToggle.style['background-color'] = "grey";
                        butIds.forEach( b => b.style.display = "none");
                        ${extraPart.hide}
                    }
                });
                `;
            };


exports.menuExtra = (menuExtra) => {

    let result = ""
    if (menuExtra !== undefined) {

        menuExtra.forEach(me => {

            me.message = me.message === undefined ? `Do you want to go at ${me.url} page?` : me.message; 

            result += `
            document.getElementById("${me.id}").addEventListener("click", () => {
                ui.popUpChoice(
                    "Attenzione",
                    "${me.message}",
                    () => { window.location.href = "${me.url}"; },
                    () => { return; }
                ); 
            });
            `;

        });

    } 

    return result;

};