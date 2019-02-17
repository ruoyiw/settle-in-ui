var userId = readCookie('userId');
// Endpoints path
var appUrl = 'https://ho1k9awhxg.execute-api.us-east-1.amazonaws.com/dev';
var values = {
    children: false,
    children_age: false,
    duration: false,
    total_assets: false,
    age_a: false,
    health_a: false,
    income_a: false,
    super_a: false,
    prior_a: false,
    dependent_a: false,
    financial_assis_a: false,
    age_b: false,
    health_b: false,
    income_b: false,
    super_b: false,
    prior_b: false,
    dependent_b: false,
    financial_assis_b: false,
    resp_a: false,
    resp_b: false,
    support_name: false,
    support_result: false,
}

var settlement = {
    id: false,
    name: false,
    value: false
}

var fields = {
    children: {
        "0": "no children",
        "1": "1 child",
        "2": "2 children",
        "3": "3 children",
        "4": "4 children",
        "5": "5 children",
        "6": "6 children",
        "7": "7 children",
        "8": "8 children",
        "9": "9 children",
        "10": "10 or more children"
    },
    children_age: {
        "0": "NA",
        "1": "1-5",
        "2": "6-10",
        "3": "11-15",
        "4": "16-18"
    },
    dependent_a: {
        "0": "no dependents",
        "1": "at least one dependent",
    },
    dependent_b: {
        "0": "no dependents",
        "1": "at least one dependent",
    },
    financial_assis_a: {
        "0": "none",
        "1": "some",
        "2": "a significant amount"
    },
    financial_assis_b: {
        "0": "none",
        "1": "some",
        "2": "a significant amount"
    },
    health_a: {
        "0": "poor",
        "1": "good"
    },
    health_b: {
        "0": "poor",
        "1": "good"
    },
    support_name: {
        "0": "Party A",
        "1": "Party B",
    },
    support_result: {
        "0": "pay",
        "1": "not pay",
    }
};

var unsettledScenarios = false;
var scenarioId = false;
var parentId = false;
var scenarioNo = 0;
var errorMessage ='We had a problem saving your data, please try again in a moment or contact luke@portable.com.au.';

/*
* Select the value for the element
*/
function selectChoice(selectId, choice) {
    $("#" + selectId).val(choice);
}

/*
* List all options from the fields variable
*/
function populateOptions() {
    $.each(fields, function(field, options) {
        var o = $('select#' + field).prop('options');
        $.each(options, function(val, text) {
            o[o.length] = new Option(text, val);
        });
    });
}

/*
* Save the scenario body
*/
function settleNewScenario() { 
    $('#step3Complete').hide();
    $.each(values, function(valueName) {
        values[valueName] = $('#' + valueName).val();
    }); 
    var jsonData = {values}
    var settlements = {};
    // if the cookie contains userId, insert the {userId: value} into settlement json string
    if (readCookie('userId')) {
        settlements[readCookie('userId')] = $('#settleSlider').val();
        jsonData['settlements'] = settlements;
    }
    jsonData['parentId'] = parentId;
    console.log(jsonData)
    $.ajax({
        contentType: 'application/json',
        data: JSON.stringify(jsonData),
        dataType: 'json',
        success: function(data){
            $('body').css("opacity", 1);
            console.log("Saved new scenario.", data);
            scenarioId = data['id'];
            $('#step3Complete').show();
            $('#step3 > .stepNo').css('color', '#15191D');
            openModal();
        },
        error: function(){
            console.log("Failed to save scenario");
            alert(errorMessage);
            $('body').css("opacity", 1);
        },
        processData: false,
        type: 'POST',
        url: appUrl + '/create'
    });
    
}

/*
* Settle the value for scenario
*/
function settleValue() {
    $('body').css("opacity", 0.3);
    // if there is a parentId, the scenario is changed based on the parent scenario, so save it as a new scenario and settle it
    if (parentId) {
        settleNewScenario();
    } 
    // else, settle the existed scenario
    else {
        $('#step1Complete').hide();
        settlement.id = scenarioId;
        settlement.name = userId;
        settlement.value = $('#settleSlider').val();
        console.log(settlement)
        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify(settlement),
            dataType: 'json', 
            success: function(data){
                console.log("settle the value.", data);
                $('body').css("opacity", 1);
                $('input[type="number"]').prop('readonly', false);
                $('select').prop('disabled', false);
                $('#step1Complete').show();
                $('#step1 > .stepNo, #step2 > .stepText').css('color', '#15191D');
                $('#step2 > .stepNo').css('color', '#0C73E6');
            },
            error: function(){
                console.log("Failed to settle value");
                alert(errorMessage);
                $('body').css("opacity", 1);
            },
            processData: false,
            type: 'POST',
            url: appUrl + '/settle'
        });
    }
}

/*
* When one of the input field changes, a new scenario will be generated.
*/
$('.scenario-input').on('input',function(e){
    // if there is no parentId set, set it as the current scenarioId
    if (!parentId) {
        parentId = scenarioId;
        console.log("parent ID", parentId) 
    } 

    // if the children number is 0, set the childcare responsibility of two parties as 0% as well
    if ($('#children').val() === '0') {
        $('#children_age').val(0);
        $('#resp_a').val(0);
        $('#resp_b').val(0);
        $('#support_result').val(1);
    }    
    if ($('#dependent_a').val() === '0') {
        $('#financial_assis_a').val(0);
    }
    if ($('#dependent_b').val() === '0') {
        $('#financial_assis_b').val(0);
    }
    scenarioId = false;
    $('#step2Complete').show();
    $('#step2 > .stepNo, #step3 > .stepText').css('color', '#15191D');
    $('#step3 > .stepNo').css('color', '#0C73E6');
});


/*
 * If the name is not empty, return all unsettled scenario IDs of that name and update the ID list
 * Otherwise, return all scenario IDs and update the ID list
 */
function getUnsettledScenarios() {
    $('input[type="number"]').prop('readonly', true);
    $('select').prop('disabled', true);
    $.ajax({
        contentType: 'application/json',
        dataType: 'json',
        success: function(data){
            unsettledScenarios = data; 
            console.log(unsettledScenarios)
            // the unsettled scenario list is not empty, update the page content
            if (unsettledScenarios.length > 0) {
                parentId = false;
                var currentScenario = unsettledScenarios[0];
                $.each(currentScenario, function(selectId, value) {
                    selectChoice(selectId, value)
                });
                scenarioId = currentScenario.id;
                scenarioNo += 1;
                $('#scenarioNo').html(scenarioNo);
                console.log("get unsettled scenarios", scenarioId);
                $('#settleSlider').val(50);
                $('#partyAValue').html('50%');
                $('#partyBValue').html('50%');
                changeSidebar();            
                $('body').css("opacity", 1);    
            }
            // else, there is no unsettled scenario, disable the settle button 
            else {
                $('#settleBtn').prop('disabled', true);
            }
        },
        error: function(){
            console.log("Failed to get scenario");
            alert(errorMessage);
            $('body').css("opacity", 1);
        },
        processData: false,
        type: 'GET',
        url: appUrl + '/scenario/list/not/'+ userId
    });
}

/*
 * Switch to the next scenario when press the "Continue" button in the modal window
 */
function nextScenario() {
    $.modal.close();
    $('body').css("opacity", 0.3);
    getUnsettledScenarios();
}

/*
 * Pop up the modal window after completing the 3rd step
 */
function openModal() {
    if (unsettledScenarios.length > 1) {
        $('.modal-content').html('Thanks, we will now present you with the next scenario.');
        $('#closeBtn').html('Continue');
    } else {
        $('.modal-content').html('All scenarios has been settled, thank you.');
        $('#closeBtn').html('OK');
    }
    $('#nextScenario').modal();
}

/*
 * Update the sidebar UI after switch to the next scenario
 */
function changeSidebar() {
    $('#step1 > .stepNo').css('color', '#0C73E6');
    $('#step1 > .stepText').css('color', '#15191D');
    $('#step1Complete, #step2Complete, #step3Complete').hide();
    $('#step2 > .stepNo, #step2 > .stepText, #step3 > .stepNo, #step3 > .stepText').css('color', '#9CA9B7');
}

/*
* Reads a cookie
*/
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1,c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length,c.length);
        }
    }
    return null;
}
console.log(userId)
if (!userId) {
    document.location.href = 'start.html';
} else {
    populateOptions();
    getUnsettledScenarios();
}

// remove the close icon on the modal window
$.modal.defaults = {
    closeClass: 'icon-remove'
};

// Make the value of party A and party B change as the slider changing
var slider = document.getElementById("settleSlider");
var partyA = document.getElementById("partyAValue");
var partyB = document.getElementById("partyBValue");

partyA.innerHTML = slider.value + '%';
partyB.innerHTML = 100 - slider.value + '%';

slider.oninput = function() {
    partyA.innerHTML = this.value + '%';
    partyB.innerHTML = 100 - this.value + '%';
}