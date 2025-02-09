window.eval("alert('unsafe!')");

function testFunc(element, attrs, content) {
    let newContent;
    if(content){
        newContent = content;
    } else {
        const qP = new URLSearchParams(location.search);
        newContent = qP.get('someKey');
    }
    
    var x = `<div align="left">${content}</div>`
    
    return '<div align="' + (attrs.defaultattr || 'left') + '">' + newContent + '</div>';
}