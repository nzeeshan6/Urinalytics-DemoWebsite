const getData = async () => {
    let li = '<tr><th>ID</th>' +
        '<th>Date</th>' +
        '<th>Time</th>' +
        '<th>Location</th>' +
        '<th>pH</th>' +
        '<th>Sodium</th>' +
        '<th>Specific Gravity</th>' +
        '<th>Uric Acid</th>' +
        '<th>TDS</th>' + 
        '<th>Albumin</th></tr>';
    try {
        let data = await fetch('/test', { method: "post" });
        let realData = await data.json();

        document.title = realData.name + '- Dashboard' + '| Urinalytics';
        document.getElementById('welcome').innerHTML = 'Welcome, ' + realData.name + ' !';
        let vitals = realData.vitals;
        if (vitals.length > 0) {
            vitals.forEach(element => {
                li = li + `<tr>
                <td>${element.id}</td>
                <td>${element.pushdate}</td>
                <td>${element.pushtime}</td>
                <td>${element.location}</td>
                <td>${element.ph}</td>
                <td>${element.sodium}</td>
                <td>${element.gravity}</td>
                <td>${element.uric}</td>
                <td>${element.tds}</td>
                <td>${element.albumin}</td>
                </tr>`;
            });
        }
        else {

        }


        document.getElementById('rows').innerHTML = li;
    } catch (error) { };
}

getData();