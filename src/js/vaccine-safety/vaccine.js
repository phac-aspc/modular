var language = $('html').attr('lang');  
var parseTime = d3.timeParse("%Y-%m-%d");
var formatTime = d3.timeFormat("%d %b %Y");
var formatTimeLong = d3.timeFormat("%B %e, %Y");
var locale;
var formatFR;
var localeFormatter;
var numberFormat,percentFormat,rateFormat,decimalFormat;
var toggleTotalDoses = false;
var pattern = ",",
re = new RegExp(pattern, "g");
let isIE = /*@cc_on!@*/ false || !!document.documentMode;
if (/Edge\/\d./i.test(navigator.userAgent))
isIE = true;

Math.log10 = Math.log10 || function(x) {
  return Math.log(x) * Math.LOG10E;
};

if(language == "en"){
    numberFormat = d3.format(",d");
    percentFormat = d3.format(",.3f");
    decimalFormat = d3.format(",.2f");
}else{
    locale = {
      "dateTime": "%a %e %b %Y %X",
      "Data cut off date": "%Y-%m-%d",
      "time": "%H:%M:%S",
      "periods": ["", ""],
      "days": ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
      "shortDays": ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
      "months": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
      "shortMonths": ["jan", "fév", "mar", "avr", "mai", "jui", "jul", "aoû", "sep", "oct", "nov", "déc"],
      "decimal": ",",
      "thousands": " ",
      "grouping": [3]
    }
	// create custom locale formatter for time from the fgiven locale options
    d3.timeFormatDefaultLocale(locale);
    formatFR = d3.timeFormat("%d %B %Y");
    formatTime = d3.timeFormat("%d %B %Y");
    formatTimeLong = d3.timeFormat("%e %B %Y");
    // create custom locale formatter for numbers from the given locale options
    localeFormatter = d3.formatDefaultLocale(locale);
    numberFormat = localeFormatter.format(",d");
    percentFormat = localeFormatter.format(",.3f");
    decimalFormat = localeFormatter.format(",.2f");
}
 
function getRoundedSFs(num, SFCount) {    
    // This runs a regex to match every "leading zeros" before and after the .
    // For the record, it splits before and after in two groups, if necessary...
    var matches = num.toString().match(/^-?(0+)\.(0*)/);

    if (matches) { // if we found at least a "0."
        var firstIndex = matches[0].length;
        var prefix = matches[0];

        sf = Number(num.toString().substring(firstIndex, firstIndex + SFCount + 1));
        sf = Math.round(sf / 10);
        sf = prefix + sf.toString();
        return Number(sf).toFixed(matches[2].length+SFCount);//matches[;
    } 
    else { // possible float not starting with 0.  like -5.574487436097115
        // matching before and after, no matter if 0 or not
        matches = num.toString().match(/^(-?(\d+))\.(\d+)/);
        
        // Rounding at good index
        var decimalShift = SFCount - matches[2].length;        
        var rounded = Math.round(num * Math.pow(10, decimalShift));       
        rounded /= Math.pow(10, decimalShift);
        
        return rounded.toFixed(decimalShift);
    }
}

function maxIndex(arr) {
    if (arr.length === 0) {
        return -1;
    }
    var max;
    if(isNaN(arr[0]))
        max = 0;
    else
        max = arr[0];
        
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

function short2txt(short){
	let shortLookup = {
		"Anaphylaxis<sup>2</sup>":"Anaphylaxis<sup>2</sup>",
		"Anaphylaxis":"Anaphylaxis",
		"Headache":"headache",
		"Severe allergic reaction":"severe allergic reaction",
		"Facial paralysis":"facial paralysis",
		"Chills":"Chills",
		"Syncope":"Syncope",
		"Pain in extremity":"Pain in extremity",
		"Burning sensation":"Burning sensation",
		"Vaccination site reactions":"Vaccination site reactions",
		"Palpitations":"Palpitations",
		"Pharyngeal swelling (throat swelling)":"Pharyngeal swelling (throat swelling)",
		"Tachypnoea (abnormally rapid breathing)":"Tachypnoea (abnormally rapid breathing)",
		"Nausea":"nausea",
		"Throat irritation":"Throat irritation",
		"Paraesthesia":"paraesthesia",
		"Total doses administered":"Total doses administered",
		"Pruritis":"pruritis",
		"Urticaria":"urticaria",
		"weekly&rate":"Weekly",
		"COVID-19<sup>3</sup>":"COVID-19<sup>3</sup>",
		"Mod COVID-19":"Moderna",
		"AZC COVID-19":"AstraZeneca",
		"Bell's Palsy/Facial paralysis":"Bell's Palsy/facial paralysis",
		"PB COVID-19":"Pfizer-BioNTech",
		"AZC COVID-19 (COVISHIELD)":"COVISHIELD",
		"Unknown":"Unknown",
		"Total":"Total",
		"Drug ineffective":"drug ineffective",
		"SARS-CoV-2 positive":"SARS-CoV-2 positive",
		"COVISHIELD/AstraZeneca (combined)":"COVISHIELD/AstraZeneca",
		"COVID-19":"COVID-19",
		"Hypersensitivity":"hypersensitivity",
		"Pruritis (itching)":"Pruritis (itching)",
		"Abdominal pain upper":"abdominal pain upper",
		"Chest pain":"Chest pain",
		"Abdominal pain":"Abdominal pain",
		"Contusion":"contusion",
		"Eye pain":"eye pain",
		"Cerebral thrombosis":"Cerebral thrombosis",
		"Joint range of motion decreased":"Joint range of motion decreased",
		"Eye swelling":"eye swelling",
		"Injection site nodule":"injection site nodule",
		"Chest discomfort":"Chest discomfort",
		"Hypoaesthesia":"hypoaesthesia",
		"Hypoaesthesia oral":"hypoaesthesia oral",
		"Dyspnoea":"dyspnoea",
		"Pruritus":"Pruritus",
		"Asthenia (weakness)":"Asthenia (weakness)",
		"Hyperhidrosis (excessive sweating)":"Hyperhidrosis (excessive sweating)",
		"total":"Total",
		"weekly":"Weekly",
		"Vaccination site pain":"Vaccination site pain",
		"Vaccintion site erythema (redness)":"Vaccintion site erythema (redness)",
		"Vaccination site erythema (redness)":"Vaccination site erythema (redness)",
		"Vaccination site swelling":"Vaccination site swelling",
		"Vaccination site warmth":"Vaccination site warmth",
		"Vaccination site pruritus (itching)":"Vaccination site pruritus (itching)",
		"Paraesthesia (tingling or prickling)":"Paraesthesia (tingling or prickling)",
		"Pruritus (itching)":"Pruritus (itching)",
		"Headache":"Headache",
		"Show total doses administered":"Show total doses administered",
		"Urticaria (hives)":"Urticaria (hives)",
		"Vaccination site reaction":"Vaccination site reaction",
		"Nausea":"Nausea",
		"Vaccination site cellulitis":"Vaccination site cellulitis",
		"Vaccination site induration (hardening)":"Vaccination site induration (hardening)",
		"Dyspnoea (laboured breathing)":"Dyspnoea (laboured breathing)",
		"Rash":"Rash",
		"Vaccination site rash":"Vaccination site rash",
		"Fatigue":"Fatigue",
		"Hypoaesthesia (numbness)":"Hypoaesthesia (numbness)",
		"Anaphylaxies":"Anaphylaxies",
		"Other allergic reactions": "Other allergic reactions",
		"Dizziness":"Dizziness",
		"Adenopathy/lymphadenopathy (swollen lymph nodes)":"Adenopathy/lymphadenopathy (swollen lymph nodes)",
		"Erythema (redness)":"Erythema (redness)",
		"Vomiting":"Vomiting",
		"Diarrhea":"Diarrhea",
		"Fever ≥ 38°C":"Fever ≥ 38°C",
		"Tachycardia (fast heartbeat)":"Tachycardia (fast heartbeat)",
		"Throat tightness":"Throat tightness",
		"Vaccination site induration (hardness)":"Vaccination site induration (hardness)",
		"Vaccination site inflammation":"Vaccination site inflammation",
		"Myalgia (muscle pain)":"Myalgia (muscle pain)",
		"Pain":"Pain",
		"Arthralgia (joint pain)":"Arthralgia (joint pain)",
		"Flushing":"Flushing",
		"Malaise (discomfort)":"Malaise (discomfort)",
		"Feeling hot":"Feeling hot",
		"Lip swelling":"Lip swelling",
		"Swollen tongue":"Swollen tongue",
		"Malaise":"Malaise",
		"Cough":"Cough",
		"Dysphagia":"Dysphagia",
		"Dysphonia (hoarse voice)":"Dysphonia (hoarse voice)",
		"Oropharyngeal pain (throat pain)":"Oropharyngeal pain (throat pain)",
		"Tachycardia (fast hearbeat)":"Tachycardia (fast hearbeat)",
		"Swelling face":"Swelling face",
		"Anaphylaxis (BCD levels 1-3)":"Anaphylaxis (BCD levels 1-3)",
		"Extensive swelling of vaccinated limb":"Extensive swelling of vaccinated limb",
		"Dermatitis allergic":"Dermatitis allergic",
		"Vaccination site oedema":"Vaccination site oedema",
		"Hypoaesthesia oral (numbness oral)":"Hypoaesthesia oral (numbness oral)",
		"Dysphagia (difficulty swallowing)":"Dysphagia (difficulty swallowing)",
		"Non-serious reporting rate":"Non-serious reporting rate",
		"Serious reporting rate":"Serious reporting rate",
		"Total rate":"Total rate",
		"N/A": "N/A",
		"Auto-immune diseases":"Auto-immune diseases",
		"Cardiovascular system":"Cardiovascular system",
		"Hepato-gastrointestinal and renal system":"Hepato-gastrointestinal and renal system",
		"Nerves and central nervous system":"Nerves and central nervous system",
		"Other system":"Other system",
		"Pregnancy outcomes":"Pregnancy outcomes",
		"Respiratory system":"Respiratory system",
		"Skin and mucous membrane, bone and joints system":"Skin and mucous membrane, bone and joints system",
		"All AESI categories":"All AESI categories",
		"Guillain-Barré Syndrome<sup>1</sup>":"Guillain-Barré Syndrome<sup>1</sup>",
		"Thrombocytopenia (low blood platelets)":"Thrombocytopenia (low blood platelets)",
		"Subtotal":"Subtotal",
		"TOTAL":"Total",
		"Cardiac arrest":"Cardiac arrest",
		"Cardiac failure":"Cardiac failure",
		"Microangiopathy":"Microangiopathy",
		"Myocardial infarction (heart attack)":"Myocardial infarction (heart attack)",
		"Myocarditis (heart inflammation)":"Myocarditis (heart inflammation)",
		"Stress cardiomyopathy":"Stress cardiomyopathy",
		"Cerebral venous (sinus) thrombosis":"Cerebral venous (sinus) thrombosis",
		"Cutaneous vasculitis":"Cutaneous vasculitis",
		"Deep vein thrombosis":"Deep vein thrombosis",
		"Embolism (artery blockage)":"Embolism (artery blockage)",
		"Haemorrhage (bleeding)":"Haemorrhage (bleeding)",
		"Pulmonary embolism":"Pulmonary embolism",
		"Thrombosis (blood clot)":"Thrombosis (blood clot)",
		"Thrombosis with thrombocytopenia syndrome (blood clot with low platelets)":"Thrombosis with thrombocytopenia syndrome (blood clot with low platelets)",
		"Acute kidney injury":"Acute kidney injury",
		"Myocarditis/Pericarditis (inflammation of the heart muscle and lining around the heart)":"Myocarditis/Pericarditis (inflammation of the heart muscle and lining around the heart)",
		"Liver injury":"Liver injury",
		"Cerebrovascular accident (stroke)":"Cerebrovascular accident (stroke)",
		"Generalized convulsion (seizure)":"Generalized convulsion (seizure)",
		"Transverse myelitis (inflammation of spinal cord)":"Transverse myelitis (inflammation of spinal cord)",
		"COVID-19<sup>3</sup>":"COVID-19<sup>3</sup>",
		"Fetal growth restriction":"Fetal growth restriction",
		"Spontaneous abortion":"Spontaneous abortion",
		"Acute respiratory distress syndrome":"Acute respiratory distress syndrome",
		"Chilblains":"Chilblains",
		"Erythema multiforme (immune skin reaction)":"Erythema multiforme (immune skin reaction)",
		"Pfizer":"Pfizer",
		"Moderna":"Moderna",
		"COVISHIELD/AstraZeneca":"COVISHIELD/AstraZeneca",
		"Total":"Total",
		"Unspecified":"Unspecified",
		"AESI Category":"AESI Category",
		"Rash generalized (non-allergic)":"Rash generalized (non-allergic)",
		"AESI":"AESI",
		"Circulatory system":"Circulatory system"
	}
	let shortLookupFR = {
	    "Auto-immune diseases":"Maladies auto-immunes",
		"Cardiovascular system":"Système cardiovasculaire",
		"Circulatory system":"Système circulatoire sanguin",
		"Hepato-gastrointestinal and renal system":"Système hépato-gastro-intestinal et rénal",
		"Nerves and central nervous system":"Nerfs et système nerveux central",
		"Other system":"Autres systèmes",
		"Pregnancy outcomes":"Issues de grossesse",
		"Respiratory system":"Système respiratoire",
		"Skin and mucous membrane, bone and joints system":"Peau et muqueuses, système osseux et articulations",
		"All AESI categories":"Toutes les catégories AESI",
		"Guillain-Barré Syndrome<sup>1</sup>":"Syndrome de Guillain-Barré<sup>1</sup>",
		"Thrombocytopenia (low blood platelets)":"Thrombocytopénie (faible taux de plaquettes)",
		"Subtotal":"Sous-total",
		"TOTAL":"Total",
		"Cardiac arrest":"Arrêt cardiaque",
		"Cardiac failure":"Insuffisance cardiaque",
		"Microangiopathy":"Microangiopathie",
		"Myocarditis/Pericarditis (inflammation of the heart muscle and lining around the heart)":"Myocardite / péricardite (inflammation du muscle cardiaque et de la muqueuse autour du cœur)",
		"Myocardial infarction (heart attack)":"Infarctus du myocarde (crise cardiaque)",
		"Myocarditis (heart inflammation)":"Myocardite (inflammation du cœur) ",
		"Stress cardiomyopathy":"Myocardiopathie liée au stress",
		"Cerebral venous (sinus) thrombosis":"Thrombose veineuse cérébrale (sinus)",
		"Cutaneous vasculitis":"Vascularite cutanée",
		"Deep vein thrombosis":"Thrombose veineuse profonde",
		"Embolism (artery blockage)":"Embolie (occlusion artérielle)",
		"Haemorrhage (bleeding)":"Hémorragie (saignement)",
		"Pruritis (itching)":"Prurit (démangeaisons)",
		"Pulmonary embolism":"Embolie pulmonaire",
		"Thrombosis (blood clot)":"Thrombose (caillot)",
		"Bell's Palsy/Facial paralysis":"Paralysie de Bell/Paralysie faciale",
		"Thrombosis with thrombocytopenia syndrome (blood clot with low platelets)":"Syndrome de thrombose avec thrombocytopénie (caillot avec faible taux de plaquettes)",
		"Acute kidney injury":"Insuffisance rénale aiguë",
		"Liver injury":"Lésion du foie",
		"Cerebrovascular accident (stroke)":"Accident vasculaire cérébral  (AVC)",
		"Generalized convulsion (seizure)":"Convulsion généralisée (crise d’épilepsie) ",
		"Transverse myelitis (inflammation of spinal cord)":"Myélite transverse (Inflammation de la moelle épinière)",
		"COVID-19<sup>3</sup>":"COVID-19<sup>3</sup>",
		"Fetal growth restriction":"Restriction de la croissance fœtale",
		"Spontaneous abortion":"Avortement spontané",
		"Acute respiratory distress syndrome":"Syndrome de détresse respiratoire aiguë",
		"Chilblains":"Érythème pernio",
		"Erythema multiforme (immune skin reaction)":"Érythème multiforme (réaction cutanée immunitaire)",
		"Anaphylaxis":"Anaphylaxie",
		"Anaphylaxis<sup>2</sup>":"Anaphylaxie<sup>2</sup>",
		"Headache":"Mal de tête",
		"Severe allergic reaction":"Une réaction allergique sévère",
		"Facial paralysis":"Une paralysie faciale",
		"Chills":"Frissons",
		"Syncope":"Une syncope",
		"Pain in extremity":"douleurs aux extrémités",
		"Vaccination site reactions":"des réactions au site de vaccination",
		"Nausea":"des nausées",
		"Show total doses administered":"Afficher le total des doses administrées",
		"Burning sensation":"Sensation de brûlure",
		"Palpitations":"Palpitations",
		"Pharyngeal swelling (throat swelling)":"Enflure pharyngée (enflure de la gorge)",
		"Tachypnoea (abnormally rapid breathing)":"Tachypnée (respiration anormalement rapide)",
		"Paraesthesia":"de la paresthésie",
		"Total doses administered":"Doses totales administrées",
		"Pruritis":"un prurit",
		"Cerebral thrombosis":"Thrombose cérébrale",
		"Chest pain":"Douleur thoracique",
		"Urticaria":"de l'urticaire",
		"Throat irritation":"Irritation de la gorge",
		"Joint range of motion decreased":"Amplitude des mouvements articulaires diminuée",
		"Mod COVID-19":"Moderna",
		"Dysphonia (hoarse voice)":"Dysphonie (voix rauque)",
		"COVISHIELD/AstraZeneca (combined)":"COVISHIELD/AstraZeneca",
		"PB COVID-19":"Pfizer-BioNTech",
		"AZC COVID-19 (COVISHIELD)":"COVISHIELD",
		"AZC COVID-19":"AstraZeneca",
		"Unknown":"Inconnu",
		"Total":"Total",
		"total":"cumulatif",
		"Rash generalized (non-allergic)":"Eruption cutanée généralisée (non allergique)",
		"weekly":"hebdomadaire",
		"weekly&rate":"hebdomadaire",
		"Chest discomfort":"Inconfort à la poitrine",
		"Hypoaesthesia":"l’hypoesthésie",
		"Hypoaesthesia oral":"l’hypoesthésie oral",
		"Oropharyngeal pain (throat pain)":"Douleur oropharyngienne (mal de gorge)",
		"Hypoaesthesia oral (numbness oral)":"Hypoesthésie orale (engourdissement oral)",
		"Pruritus":"Pruritus",
		"Dyspnoea":"la dyspnée",
		"Vaccination site pain":"Douleur au point d’injection",
		"Vaccintion site erythema (redness)":"Érythème au site de vaccination (rougeur)",
		"Vaccination site erythema (redness)":"Érythème au point d’injection (rougeur)",
		"Vaccination site swelling":"Enflure au point d’injection",
		"Vaccination site warmth":"Chaleur au point d’injection",
		"Vaccination site pruritus (itching)":"Prurit au point d’injection (démangeaisons)",
		"Paraesthesia (tingling or prickling)":"Paresthésie (chatouillement ou picotement)",
		"Pruritus (itching)":"Prurit (démangeaisons)",
		"Headache":"Mal de tête",
		"Urticaria (hives)":"Urticaire (éruptions cutanées)",
		"Vaccination site reaction":"Réaction au point d’injection",
		"Nausea":"Nausée",
		"Vaccination site cellulitis":"Cellulite au point d’injection",
		"Vaccination site induration (hardening)":"Induration au point d’injection (durcissement)",
		"Dyspnoea (laboured breathing)":"Dyspnée (essoufflement)",
		"Rash":"Rash",
		"Vaccination site rash":"Rash au point d’injection",
		"Fatigue":"Fatigue",
		"Asthenia (weakness)":"Asthénie (faiblesse)",
		"Hyperhidrosis (excessive sweating)":"Hyperhidrose (sueur excessive)",
		"Tachycardia (fast hearbeat)":"Tachycardie (rythme cardiaque rapide)",
		"Swollen tongue":"Langue enflée",
		"Abdominal pain":"Douleurs abdominales",
		"Hypoaesthesia (numbness)":"Hypo-esthésie (engourdissement)",
		"Anaphylaxies":"Anaphylaxie",
		"Other allergic reactions":"Autres réactions allergiques",
		"Dizziness":"Étourdissements",
		"Adenopathy/lymphadenopathy (swollen lymph nodes)":"Enflure des ganglions lympthiques",
		"Erythema (redness)": "Érythème (rougeur)",
		"Vomiting":"Vomissements",
		"Diarrhea":"Diarrhée",
		"Fever ≥ 38°C":"Fièvre ≥ 38°C",
		"Tachycardia (fast heartbeat)":"Tachycardie (pouls rapide)",
		"Throat tightness":"Serrement à la gorge",
		"Vaccination site induration (hardness)":"Induration au point d’injection (durcissement)",
		"Vaccination site inflammation":"Inflammation au point d'injection",
		"Myalgia (muscle pain)":"Myalgie (douleur musculaires)",
		"Pain":"Douleur",
		"Arthralgia (joint pain)":"Arthralgie (douleur aux articulations)",
		"Flushing":"Rougeurs au visage et au cou",
		"Malaise (discomfort)":"Malaise (inconfort)",
		"Feeling hot":"Sentiment de chaleur",
		"Lip swelling":"Gonflement des lèvres",
		"Malaise":"Malaise",
		"Cough":"Toux",
		"Dysphagia":"La dysphagie",
		"Swelling face":"Visage gonflé",
		"Anaphylaxis (BCD levels 1-3)":"Anaphylaxie (niveaux de BCD 1-3)",
		"Vaccination site oedema":"Œdème au site de vaccination",
		"Dysphagia (difficulty swallowing)":"Dysphagie (difficulté à avaler)",
		"Extensive swelling of vaccinated limb":"Enflure étendue du membre vacciné",
		"Dermatitis allergic":"Dermatite allergique",
		"Non-serious reporting rate":"Taux sans gravité",
		"Serious reporting rate":"Taux grave",
		"Total rate":"Taux cumulatif",
		"N/A":"s.o.",
		"Pfizer":"Pfizer",
		"Moderna":"Moderna",
		"COVISHIELD/AstraZeneca":"COVISHIELD/AstraZeneca",
		"Total":"Total",
		"Unspecified":"Non précisé",
		"AESI Category":"Catégorie de EIIP",
		"AESI":"EIIP"
	}
	if(language == "en"){
        return shortLookup[short];
    }else{
        return shortLookupFR[short];
    }
}

var csvfiles = [
	'/src/data/covidLive/vaccine-safety/vaccine-safety-keyupdates.csv',
	'/src/data/covidLive/vaccine-safety/vaccine-safety-figure1.csv',
	'/src/data/covidLive/vaccine-safety/vaccine-safety-figure2.csv',
	'/src/data/covidLive/vaccine-safety/vaccine-safety-figure3.csv',
	'/src/data/covidLive/vaccine-safety/vaccine-safety-figure4.csv',
	'/src/data/covidLive/vaccine-safety/vaccine-safety-AEFI.csv',
	'/src/data/covidLive/vaccine-safety/vaccine-safety-severity.csv',
	'/src/data/covidLive/vaccination-coverage/vaccination-coverage-overall.csv',
	'/src/data/covidLive/vaccine-safety/vaccine-safety-AEFI-figure.csv',
	"/src/data/covidLive/vaccine-safety/vaccine-safety-AESIs-table.csv"
]


var promises = [];

csvfiles.forEach(function(url) {
    promises.push(d3.csv(url))
});

Promise.all(promises).then(function(values) {
    keyUpdates(values[0],values[7]);
    figure1(values[1]);
    figure2(values[2]);
    figure3(values[3]);
    figure4(values[4],values[5],values[6]);
    figure5(values[8]);
    AESITable(values[9]);
    $("#AESITable-dropdown-measure").on("change", function(e) {
        AESITable(values[9]);
    });
});

function keyUpdates(data,doseData){
    var currentDate = data.length - 1;
    var currentDatePrevious = currentDate - 1;
    
    updateTime();
    updateKeyUpdates();
    
    function updateTime(){
        var formatTime = d3.timeFormat("%B %-d, %Y");
        var formatTimeFr = d3.timeFormat("%-d %B %Y")
        var formatTime2 = d3.timeFormat("%B %-d, %Y, %-I %p EDT");
        var formatTime3 = d3.timeFormat("%Y-%m-%d");
        var parseTime = d3.timeParse("%Y-%m-%d");
        var parseTime2 = d3.timeParse("%Y-%m-%d %H:%M");
        
        var oneDayMillis = 1000*60*60*24;
        var sevenDaysBefore = new Date(parseTime(data[currentDate]["Data cut off date"]) - (6 * oneDayMillis));
    
        $(".dateFrom").text(formatTime(sevenDaysBefore));
        if(language == "fr")
            d3.selectAll(".dateToShort").text(formatTimeFr(parseTime(data[currentDate]["Data cut off date"])));
        else
            d3.selectAll(".dateToShort").text(formatTime(parseTime(data[currentDate]["Data cut off date"])));
            
        $(".dateWeek").text(data[currentDate]["Week"]);
        $(".dateModified").text(formatTime3(parseTime(data[currentDate]["Web posting date"])));
    }
        
    function updateKeyUpdates(){
        var totalAEFIs = +data[currentDate]["Total reports"];
        var totalSeriousAEFIs = +data[currentDate]["Serious reports"];
        var previousTotalSeriousAEFIs = +data[currentDate-1]["Serious reports"];
        var percentSeriousAEFIs = totalSeriousAEFIs/totalAEFIs * 100;
        var totalNonseriousAEFIs = +data[currentDate]["Non-serious reports"];
        var previousTotalNonSeriousAEFIs = +data[currentDate-1]["Non-serious reports"];
        var percentNonseriousAEFIs = totalNonseriousAEFIs/totalAEFIs * 100;
        var newAEFIs = +data[currentDate]["New AEFI reports since last update"];
        var totalDoses = data[currentDate]["Number of doses administered"];
        var percentCoverageTotal = data[currentDate]["%Total reports"];
        var percentCoverageSerious = data[currentDate]["%Serious reports"];
        var percentCoverageNonSerious = data[currentDate]["%Non-serious reports"];
        var currentWeekAEFIs = totalAEFIs / currentDate + 1;
        let percentSpacing = "";
        if(language == "fr"){
            percentSpacing = " ";
        }
        $(".totalAEFIs").text(numberFormat(totalAEFIs));
        $(".totalSeriousAEFIs").text(numberFormat(totalSeriousAEFIs));
        $(".percentSeriousAEFIs").text(numberFormat(percentSeriousAEFIs) + percentSpacing);
        $(".totalNonseriousAEFIs").text(numberFormat(totalNonseriousAEFIs));
        $(".percentNonseriousAEFIs").text(percentFormat(percentNonseriousAEFIs) + percentSpacing);
        $(".percentageDosesAdminTotal").text((language == "fr" ? percentCoverageTotal.replace(".",",") : percentCoverageTotal));
        $(".percentageDosesAdminSerious").text((language == "fr" ? percentCoverageSerious.replace(".",",") : percentCoverageSerious));
        $(".percentageDosesAdminNonSerious").text((language == "fr" ? percentCoverageNonSerious.replace(".",",") : percentCoverageNonSerious));
        $(".newAEFIs").text(numberFormat(newAEFIs));
        $(".newSeriousAEFIs").text(numberFormat(totalSeriousAEFIs-previousTotalSeriousAEFIs));
        $(".newNonSeriousAEFIs").text(numberFormat(totalNonseriousAEFIs-previousTotalNonSeriousAEFIs));
        $(".totalDoses").text(numberFormat(totalDoses.replace(",","")));
        $(".totalDosesDate").text(formatTimeLong(parseTime(currentDate)));
        $(".coveragePer100KTotal").text((language == "fr" ? ((totalAEFIs/Number(totalDoses.replace(",",""))*100000).toFixed(1) + "").replace(".",",") : (totalAEFIs/Number(totalDoses.replace(",",""))*100000).toFixed(1) + ""));
        $(".coveragePer100KSerious").text((language == "fr" ? ((totalSeriousAEFIs/Number(totalDoses.replace(",",""))*100000).toFixed(1) + "").replace(".",",") : (totalSeriousAEFIs/Number(totalDoses.replace(",",""))*100000).toFixed(1) + ""));
        $(".currentWeekAEFIs").text(numberFormat(currentWeekAEFIs));
    }
    
    let vaccineType = $("#vaccine-type option:selected").text();
    $(".vaccine-type1").text(vaccineType);
    $(".vaccine-type2").text(vaccineType.toLowerCase());
    
    $("#vaccine-type").on("change", function(e) {
        if (this.value == "influenza") {
            vaccineType = "Influenza";
            $(".vaccine-type2").text(vaccineType.toLowerCase());
        } else {
            vaccineType = "COVID-19";
            $(".vaccine-type2").text(vaccineType);
        }
        
        $(".vaccine-type1").text(vaccineType);
    }); 
    
}
function figure1(data){
    let formatFigure1 = d3.timeFormat("%d-%b-%y")
    
    if(language == "en")
        formatTime = d3.timeFormat("%d-%b-%y");
    else
        formatTime = d3.timeFormat("%d-%b-%y")

    let tableA = d3.select("#figure1aTable");
        
    tableA
        .append("tbody")
        .selectAll("tr")
        .data(data)
        .enter()
        .append("tr")
        .html(function(d){
            let currDate = formatTime(new Date(parseTime(d["Data cut off date"])));
            return "<td>"+(currDate)+"</td><td>"+numberFormat(d["Weekly Non-serious reports"])+"</td><td>"+numberFormat(d["Weekly Serious reports"])+"</td><td>"+numberFormat(d["Cumulative Non-serious reports"])+"</td><td>"+numberFormat(d["Cumulative Serious reports"])+"</td><td>"+numberFormat(d["Doses administered"])+"</td><td>"+numberFormat(d["Weekly doses administered"])+"</td><td>"+decimalFormat(d["Weekly Non-serious reporting rate"])+"</td><td>"+decimalFormat(d["Weekly Serious reporting rate"])+"</td><td>"+decimalFormat(d["Weekly Total Rate"])+"</td>";
        });
    
    var parseTimeFigure1;

    var legendJSON = {};
    var keys1 = [];
    var colors = [];
    var selectKeys1 = {};
    var toggleTotalDoses = false;
    var svg;

    parseTimeFigure1 = d3.timeParse("%Y-%m-%d")

    if(language == "en"){
        legendJSON = {
            "Weekly Serious reports": "Serious",
            "Weekly Non-serious reports": "Non Serious"
        };
    }else {
        legendJSON = {
            "Weekly Non-serious reports": "Sans gravité",
            "Weekly Serious reports": "Grave"
        };
    }
    keys1 = ["Weekly Non-serious reports","Weekly Serious reports"];
    selectKeys1 = {
        "Weekly Serious reports": "SeriousAEFIs",
        "Weekly Non-serious reports": "NonSeriousAEFIs"
    }
    colors = ["#8c96c6","#88419d"];
    svg = d3.select("#figure1div").select("#figure1");
    
    const margin = {
        top: 30,
        right: 85,
        bottom: 100,
        left: 75
    };

    let isIE = /*@cc_on!@*/ false || !!document.documentMode;
    if (/Edge\/\d./i.test(navigator.userAgent))
        isIE = true;

    let width = 1140 - margin.left - margin.right;
    let height = 520 - margin.top - margin.bottom;

    svg = svg
        .attr("width", function(d) {
            if (isIE) {
                return (width + margin.left + margin.right);
            }
            else {
                return;
            }
        })
        .attr("height", function(d) {
            if (isIE) {
                return (height + margin.top + margin.bottom);
            }
            else {
                return;
            }
        })
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1140 580")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    let x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    let y = d3.scaleLinear()
        .range([height, 10]);

    var z = d3.scaleOrdinal()
        .range(colors);

    svg.append("g")
        .attr("class", "y-axis-2");

    svg.append("g")
        .attr("class", "x-axis-2");

    var xAxisTitle = svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 40) + ")")
        .style("text-anchor", "middle")
        .attr("class", "x-axis-title-2");

    var yAxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", - 5 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title-2");
    
    var selectedBreakdown = null;
    x.domain(data.map(function(d) {
        return formatTime(parseTime(d["Data cut off date"]));
    }));

    z = d3.scaleOrdinal()
    .range(colors);
    
    z.domain(keys1);

    svg.select(".x-axis-2").attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", 15)//24
        .style("text-anchor", "end")
        .attr("transform", "rotate(-25)")
        .attr("x", 0)
        .attr("y", 10);

    svg.select(".x-axis-2")
        .selectAll(".tick line")
        .style("stroke", "black")
        .style("stroke-width", "2px");
    
    xAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en")
                return "Week report received";
            else
                return "Rapports hebdomadaires reçus";
        }); 
        
    let yMax = [];
    data.map(function(d) {
        yMax.push(Number(d[keys1[0]]) + Number(d[keys1[1]]));
    })
        
    y.domain([0, d3.max(yMax) + 150]);

    svg.select(".y-axis-2")
        .transition()
        .duration(500)
        .call(d3.axisLeft(y).ticks(5))
        .selectAll(".tick")
        .style("font-size", 14)
        .select("line")
        .style("font-size", 12)
        .attr('x2', width)
        .selectAll("text")
        .style("font-size", 24)

    svg.select(".y-axis-2")
        .selectAll("text")
        .style("font-size", 15)
    
    yAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en")
                return "Weekly number of reports";
            else
                return "Nombre cumulatif de rapports";
        });    

    let stack = d3.stack();
    
    svg.append("g")
        .attr("class","backgroundG")
        .selectAll(".backgroundDoses")
        .data(data)
        .enter()
        .append("rect")
        .attr("class","backgroundDoses")
        .attr("fill", function(d) { return "#CFB997"; })
        .attr("x", function(d) {
            if(x.bandwidth() > width/5)
                return x(formatTime(parseTime(d["Data cut off date"]))) + 15;
            else
                return x(formatTime(parseTime(d["Data cut off date"])));
        })
        .attr("y", function(d) { return y(0); })
        .attr("height", function(d) { return 0; })
        .attr("width", function(d){
            if(x.bandwidth() > width/5)
                return width/5;
            else
                return x.bandwidth();
            })
        .append("title")
        .text(function(d,i){
            return "Total Doses administered: " + d["Doses administered"];
        });
            
    svg.selectAll(".serie1")
        .data(stack.keys(keys1)(data))
        .enter()
        .append("g")
        .attr("class", function(d,i) {
            return "serie1 " + selectKeys1[d.key];
        })
        .on("click", function(d,i) {
            let j = i;
            if(i == 0)
                j = 1;
            else
                j = 0;
            if(keys1.length > 1){
                isolate(data, selectKeys1, d.key, svg);
                if(d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("text").attr("class") == "added" && d3.select(".serie1legend." + selectKeys1[d.key]).select("text").attr("class") == "removed"){
                    d3.selectAll(".serie1legend").selectAll("text").style("fill","#333").attr("class","added");
                    d3.selectAll(".serie1legend").selectAll("rect").attr("fill", function(d) { return z(d); }).attr("class","added");
                }else if(d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("text").attr("class") == "added"){
                    d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("text").style("fill","#bfbfbf").attr("class","removed");
                    d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("rect").attr("fill","#bfbfbf").attr("class","removed");
                }else{
                    d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("text").style("fill","#333").attr("class","added");
                    d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("rect").attr("fill", function(d) { return z(d); }).attr("class","added");
                }
            }
        })
        .attr("fill", function(d) { return z(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("x", function(d) {
            if(x.bandwidth() > width/5)
                return x(formatTime(parseTime(d.data["Data cut off date"]))) + 15;
            else
                return x(formatTime(parseTime(d.data["Data cut off date"])));
        })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width", function(d){
            if(x.bandwidth() > width/5)
                return width/5;
            else
                return x.bandwidth();
            })
        .append("title")
        .text(function(d,i){
            return legendJSON[this.parentNode.parentNode.__data__.key] + ": " + d.data[this.parentNode.parentNode.__data__.key];
        });
        
    var legend = svg.append("g")
        .attr("class","legendG")
        .attr("font-family", "sans-serif")
        .attr("font-size", "22px")
        .attr("text-anchor", "start")
        .selectAll("g")
        .data(keys1.slice().reverse())
        .enter().append("g")
        .attr("class",function(d,i){
            return "serie1legend " + selectKeys1[d];
        })
        .attr("transform", function(d,i) { return "translate("+ Math.pow(-1,(i+1))*100 + "," +  0 + ")"; });
     
    legend.append("rect")
        .on("click", function(d,i) {
            let j = i;
            if(i == 0)
                j = 1;
            else
                j = 0;
            if(keys1.length > 1){
                isolate(data, selectKeys1, d, svg);
                if(d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").attr("class") == "added" && d3.select(".serie1legend." + selectKeys1[d]).select("text").attr("class") == "removed"){
                    d3.selectAll(".serie1legend").selectAll("text").style("fill","#333").attr("class","added");
                    d3.selectAll(".serie1legend").selectAll("rect").attr("fill", function(d) { return z(d); }).attr("class","added");
                }else if(d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").attr("class") == "added"){
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").style("fill","#bfbfbf").attr("class","removed");
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("rect").attr("fill","#bfbfbf").attr("class","removed");
                }else{
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").style("fill","#333").attr("class","added");
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("rect").attr("fill", function(d) { return z(d); }).attr("class","added");
                }
            }
        })
        .attr("x", 430)
        .attr("y", 470)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", function(d) { return z(d); })
        .style("stroke-width", "0.5px")
        .style("stroke", "black")
        .attr("class","added")
        
    legend.append("text")
        .on("click", function(d,i) {
            let j = i;
            if(i == 0)
                j = 1;
            else
                j = 0;
            if(keys1.length > 1){
                isolate(data, selectKeys1, d, svg);
                if(d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").attr("class") == "added" && d3.select(".serie1legend." + selectKeys1[d]).select("text").attr("class") == "removed"){
                    d3.selectAll(".serie1legend").selectAll("text").style("fill","#333").attr("class","added");
                    d3.selectAll(".serie1legend").selectAll("rect").attr("fill", function(d) { return z(d); }).attr("class","added");
                }else if(d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").attr("class") == "added"){
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").style("fill","#bfbfbf").attr("class","removed");
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("rect").attr("fill","#bfbfbf").attr("class","removed");
                }else{
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").style("fill","#333").attr("class","added");
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("rect").attr("fill", function(d) { return z(d); }).attr("class","added");
                }
            }
        })
        .attr("x", 460)
        .attr("y", 480)
        .attr("dy", "0.4em")
        .text(function(d) { return legendJSON[d]; })
        .attr("class","added");

    //Creation of line graph for total
    let y3 = d3.scaleLinear()
    .domain([0,d3.max(data, function(d){ return parseFloat(d["Doses administered"]);}) + 6000000])
    .range([height, 0]);
    
    let lineTotalDoses = d3.line()
    .x(function(d){ return x(formatTime(parseTime(d["Data cut off date"]))) + x.bandwidth() / 2;})
    .y(function(d){ return y3(parseFloat(d["Doses administered"]));});
    
    //Creation of line graph for weekly
    let y2 = d3.scaleLinear()
    .domain([0,d3.max(data, function(d){ return parseFloat(d["Weekly Total Rate"]);}) + 35])
    .range([height, 0]);
    
    let lineSerious = d3.line()
    .x(function(d){ return x(formatTime(parseTime(d["Data cut off date"]))) + x.bandwidth() / 2;})
    .y(function(d){ return y2(parseFloat(d["Weekly Serious reporting rate"]));});
    
    let lineNonSerious = d3.line()
    .x(function(d){ return x(formatTime(parseTime(d["Data cut off date"])))+ x.bandwidth() / 2;})
    .y(function(d){ return y2(parseFloat(d["Weekly Non-serious reporting rate"]));});
    
    let lineTotal = d3.line()
    .x(function(d){ return x(formatTime(parseTime(d["Data cut off date"])))+ x.bandwidth() / 2;})
    .y(function(d){ return y2(parseFloat(d["Weekly Total Rate"]));});

    svg.append("path")
      .attr("class","dosesLine")
      .attr("fill", "none")
      .attr("stroke", "#a9a9a9")
      .attr("stroke-miterlimit", 1)
      .attr("stroke-width", 6)
      .attr("d", lineTotalDoses(data))
      .style("opacity",0)
      .append("title")
      .data(data)
      .text(function(d){
          return "Total Doses Administered : "+numberFormat(d3.max(data, function(d){ return parseFloat(d["Doses administered"]);}))
      });
      
    svg.append("path")
      .attr("class","weeklyLine")
      .attr("fill", "none")
      .attr("stroke", "#F3FE2A")
      .attr("stroke-miterlimit", 1)
      .attr("stroke-width", 6)
      .attr("d", lineSerious(data))
      .style("opacity",0);
      
    svg.append("path")
      .attr("class","weeklyLine")
      .attr("fill", "none")
      .attr("stroke", "#1BA761")
      .attr("stroke-miterlimit", 1)
      .attr("stroke-width", 6)
      .attr("d", lineNonSerious(data))
      .style("opacity",0);
      
    svg.append("path")
      .attr("class","weeklyLine")
      .attr("fill", "none")
      .attr("stroke", "#0F0F0F")
      .attr("stroke-miterlimit", 1)
      .attr("stroke-width", 6)
      .attr("d", lineTotal(data))
      .style("opacity",0);

    var y2AxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 1030)
        .attr("x", -195)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title-3")
        .text(function(){
            if(language == "en")
                return "Reports per 100,000 doses administered";
            else
                return "Rapports pour 100 000 doses administrées";
            })
        .style("opacity",0);
        
    var y3AxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 1044)
        .attr("x", -195)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title-4")
        .text(function(){
            if(language == "en")
                return "Total doses administered";
            else
                return "Doses totales administrées";
            })
        .style("opacity",0);  
        
    svg.append("g")
        .attr("class", "y-axis-4")
        .style("opacity",0);
        
    svg.select(".y-axis-4")
        .call(d3.axisRight(y3).ticks(6))
        .attr("transform", "translate("+width+",0)")
        .selectAll(".tick")
        .style("font-size", 12)
        .selectAll("text")
        .style("font-size", 20);

    svg.select(".y-axis-4")
        .selectAll("text")
        .style("font-size", 12); 
        
    svg.append("g")
        .attr("class", "y-axis-3")
        .style("opacity",0);
        
    svg.select(".y-axis-3")
        .call(d3.axisRight(y2).ticks(6))
        .attr("transform", "translate("+width+",0)")
        .selectAll(".tick")
        .style("font-size", 14)
        .selectAll("text")
        .style("font-size", 24);

    svg.select(".y-axis-3")
        .selectAll("text")
        .style("font-size", 15); 
        
    var lineLegend = svg.append("g")
        .attr("class","lineLegendG")
        .attr("font-family", "sans-serif")
        .attr("font-size", "22px")
        .attr("text-anchor", "start")
        .style("opacity",0)
        .selectAll("g")
        .data(["Serious reporting rate","Non-serious reporting rate","Total rate"])
        .enter().append("g")
        .attr("transform", function(d,i) { return "translate("+ i*362 + "," + 0 + ")"; });
    
    lineLegend.append("rect")
        .attr("x", 60)
        .attr("y", 515)
        .attr("width", 30)
        .attr("height", 8)
        .attr("fill", function(d){
            if(d == "Non-serious reporting rate")
                return "#1BA761";
            else if(d == "Serious reporting rate")
                return "#F3FE2A";
            else
                return "#0F0F0F";
        })
        .style("stroke-width", "0.5px")
        .style("stroke", "black");
        
    lineLegend.append("text")
        .attr("x", 100)
        .attr("y", 520)
        .attr("dy", "0.3em")
        .text(function(d) { return short2txt(d); });
        
    var lineLegend = svg.append("g")
        .attr("class","lineLegendG2")
        .attr("font-family", "sans-serif")
        .attr("font-size", "22px")
        .attr("text-anchor", "start")
        .style("opacity",0)
        .selectAll("g")
        .data(["Total doses administered"])
        .enter().append("g")
        .attr("transform", function(d,i) { return "translate("+ i*100 + "," + 0 + ")"; });
    
    lineLegend.append("rect")
        .attr("x", 365)
        .attr("y", 515)
        .attr("width", 30)
        .attr("height", 8)
        .attr("fill", function(d){
            return "#a9a9a9";
        })
        .attr("id","totalDosesLine")
        .style("opacity",0)
        .style("stroke-width", "0.5px")
        .style("stroke", "black");
    
    lineLegend.append("text")
        .style("opacity",0)
        .attr("x", 410)
        .attr("y", 520)
        .attr("dy", "0.3em")
        .attr("id","totalText")
        .text(function(d) { return short2txt(d); });
        
    lineLegend.append("rect")
        .attr("x", 46)
        .attr("y", 50)
        .attr("width", 20)
        .attr("height", 20)
        .attr("rx",5)
        .attr("fill", function(d){
            return "white";
        })
        .style("stroke-width", "1px")
        .style("stroke", "black")
        .style("cursor", "pointer")
        .on("click",function(){
            toggleTotalDosesOpacity();
        });
    
    lineLegend.append("rect")
        .attr("id","checkBoxFill")
        .attr("x", 50)
        .attr("y", 54)
        .attr("width", 12)
        .attr("height", 12)
        .attr("rx",3)
        .attr("fill", function(d){
            return "black";
        })
        .style("opacity",0)
        .style("cursor", "pointer")
        .on("click",function(){
            toggleTotalDosesOpacity();
        });;
        
    lineLegend.append("text")
        .attr("x", 75)
        .attr("y", 60)
        .attr("dy", "0.3em")
        .style("cursor", "pointer")
        .text(function(d) { return short2txt("Show total doses administered"); })
        .on("click",function(){
            toggleTotalDosesOpacity();
        });
        
    //overlap cube transparence
    svg.append("rect")
        .attr("x",850)
        .attr("width",x.bandwidth() * 3.4)
        .attr("height",height)
        .attr("id","overlapRect")
        .style("fill","#a9a9a9")
        .style("opacity",0.3)
    
    $("#figure1-dropdown-measure").on("change", function(e) {
        let measure2 = document.getElementById('figure1-dropdown-measure_2');
        updateFigure1(data,this.value,measure2.options[measure2.selectedIndex].value);
    });
    
    $("#figure1-dropdown-measure_2").on("change", function(e) {
        let measure1 = document.getElementById('figure1-dropdown-measure');
        updateFigure1(data,measure1.options[measure1.selectedIndex].value,this.value);
    });
    
    function toggleTotalDosesOpacity(){
        if(toggleTotalDoses){
            toggleTotalDoses = false;
            d3.select(".y-axis-4").transition().duration(500).style("opacity",0);
            d3.select("#checkBoxFill").style("opacity",0);
            d3.select(".y-axis-title-4").transition().duration(500).style("opacity",0);
            d3.select(".dosesLine").transition().duration(500).style("opacity",0);
            d3.select("#totalDosesLine").transition().duration(500).style("opacity",0);
            d3.select("#totalText").transition().duration(500).style("opacity",0);
        } else {
            toggleTotalDoses = true;
            d3.select(".y-axis-4").transition().duration(500).style("opacity",1);
            d3.select("#checkBoxFill").style("opacity",1);
            d3.select(".y-axis-title-4").transition().duration(500).style("opacity",1);
            d3.select(".dosesLine").transition().duration(500).style("opacity",1);
            d3.select("#totalDosesLine").transition().duration(500).style("opacity",1);
            d3.select("#totalText").transition().duration(500).style("opacity",1);
        }
    }
    function isolate(data, keys1, key, svg) {
        if (selectedBreakdown != null ) {
            
            let stack = d3.stack();
            let stacked = stack.keys(Object.keys(keys1).sort())(data);
        
            svg.selectAll(".serie1")
                .data(stacked)
                .selectAll("rect")
                .data(function(d){
                    return d;
                })
                .transition()
                .duration(500)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .style("opacity", 1);
            
            selectedBreakdown = null;
        } else {
            selectedBreakdown = keys1[key];
            
            svg.select("." + selectedBreakdown)
                .selectAll("rect")
                .transition()
                .duration(500)
                .attr("y", function(d) {
                    return y(d.data[key]);
                });
            
            svg.selectAll(".serie1:not(." + selectedBreakdown + ")")
                .selectAll("rect")
                .transition()
                .duration(500)
                .style("opacity", 0);
        }
    }
    
    function updateFigure1(data,measure,measure2){
        var parseTimeFigure1;
    
        var legendJSON = {};
        var keys1 = [];
        var colors = [];
        var svg;
        
        parseTimeFigure1 = d3.timeParse("%Y-%m-%d")
        d3.select("#overlapRect").transition().duration(500).style("opacity",0.3);
        d3.select(".legendG").transition().duration(500).style("opacity",1);
        if(measure == "total"){
            //Remove linegraph stuff
            d3.selectAll(".weeklyLine").transition().duration(500).style("opacity",0);
            d3.select(".y-axis-title-3").transition().duration(500).style("opacity",0);
            d3.select(".y-axis-3").transition().duration(500).style("opacity",0);
            d3.select(".lineLegendG").transition().duration(500).style("opacity",0);
            
            d3.select(".NonSeriousAEFIs").transition().duration(500).style("opacity",1);
            d3.select(".SeriousAEFIs").transition().duration(500).style("opacity",1);
            d3.select(".legendG").transition().duration(500).style("opacity",1);
            d3.select(".y-axis-title-2").transition().duration(500).style("opacity",1);
            d3.select(".y-axis-2").transition().duration(500).style("opacity",1);
            
            d3.select(".y-axis-4").transition().duration(500).style("opacity",0);
            d3.select(".lineLegendG2").transition().duration(500).style("opacity",1);
            d3.select(".y-axis-title-4").transition().duration(500).style("opacity",0);
            d3.select(".dosesLine").transition().duration(500).style("opacity",0);
            
            if(language == "en"){
                document.getElementById("note").innerHTML= "<strong>Note:</strong> Although the cumulative number of adverse event reports continues to increase over time, so does the number of doses administered. Up to and including June 4, adverse event reports represented 0.027% of all doses administered.";
            } else {
                document.getElementById("note").innerHTML= "<strong>Remarque:</strong> Bien que le nombre cumulatif de rapports d'événements secondaires continue d'augmenter avec le temps, le nombre de doses administrées augmente également. En date du 4 juin, les rapports d'événements indésirables représentaient 0,027% de toutes les doses administrées.";
            }
            
            if(measure2 == "number"){
                if(language == "en"){
                    legendJSON = {
                        "Cumulative Serious reports": "Serious",
                        "Cumulative Non-serious reports": "Non Serious"
                    };
                }else {
                    legendJSON = {
                        "Cumulative Non-serious reports": "Sans gravité",
                        "Cumulative Serious reports": "Grave"
                    };
                }
                keys1 = ["Cumulative Non-serious reports","Cumulative Serious reports"];
                selectKeys1 = {
                    "Cumulative Serious reports": "SeriousAEFIs",
                    "Cumulative Non-serious reports": "NonSeriousAEFIs"
                }
            } else {
                if(language == "en"){
                    legendJSON = {
                        "Cumulative Serious reporting rate": "Serious",
                        "Cumulative Non-serious reporting rate": "Non Serious"
                    };
                }else {
                    legendJSON = {
                        "Cumulative Non-serious reporting rate": "Sans gravité",
                        "Cumulative Serious reporting rate": "Grave"
                    };
                }
                keys1 = ["Cumulative Non-serious reporting rate","Cumulative Serious reporting rate"];
                selectKeys1 = {
                    "Cumulative Serious reporting rate": "SeriousAEFIs",
                    "Cumulative Non-serious reporting rate": "NonSeriousAEFIs"
                }
            }
        }
        else{
            
            document.getElementById("note").innerHTML= "";

            if(measure == "rate" || measure == "weekly&rate"){
                //Remove line graph
                d3.selectAll(".weeklyLine").transition().duration(500).style("opacity",1);
                d3.select(".y-axis-title-3").transition().duration(500).style("opacity",1);
                d3.select(".y-axis-3").transition().duration(500).style("opacity",1);
                d3.select(".lineLegendG").transition().duration(500).style("opacity",1);
            } else{
                d3.select("#figure1").selectAll("path").transition().duration(500).style("opacity",0);
                d3.select(".y-axis-title-3").transition().duration(500).style("opacity",0);
                d3.select(".y-axis-3").transition().duration(500).style("opacity",0);
                d3.select(".lineLegendG").transition().duration(500).style("opacity",0);
            }
            
            d3.select(".y-axis-4").transition().duration(500).style("opacity",0);
            d3.select(".lineLegendG2").transition().duration(500).style("opacity",0);
            d3.select(".y-axis-title-4").transition().duration(500).style("opacity",0);
            d3.select(".dosesLine").transition().duration(500).style("opacity",0);
            
            if(measure2 == "number"){
                if(language == "en"){
                    legendJSON = {
                        "Weekly Serious reports": "Serious AEFIs",
                        "Weekly Non-serious reports": "Non Serious AEFIs"
                    };
                }else {
                    legendJSON = {
                        "Weekly Non-serious reports": "Grave",
                        "Weekly Serious reports": "Sans gravité"
                    };
                }
                keys1 = ["Weekly Non-serious reports","Weekly Serious reports"];
                selectKeys1 = {
                    "Weekly Serious reports": "SeriousAEFIs",
                    "Weekly Non-serious reports": "NonSeriousAEFIs"
                }
            } else {
                if(language == "en"){
                    legendJSON = {
                        "Weekly Serious reporting rate": "Serious AEFIs",
                        "Weekly Non-serious reporting rate": "Non Serious AEFIs"
                    };
                }else {
                    legendJSON = {
                        "Weekly Non-serious reporting rate": "Grave",
                        "Weekly Serious reporting rate": "Sans gravité"
                    };
                }
                keys1 = ["Weekly Non-serious reporting rate","Weekly Serious reporting rate"];
                selectKeys1 = {
                    "Weekly Serious reporting rate": "SeriousAEFIs",
                    "Weekly Non-serious reporting rate": "NonSeriousAEFIs"
                }
            }
        }
        colors = ["#8c96c6","#88419d"];
        svg = d3.select("#figure1div").select("#figure1");
        
        let selectedBreakdown = null;
        x.domain(data.map(function(d) {
            return formatTime(parseTime(d["Data cut off date"]));
        }));
        
        z.domain(keys1);
    
        svg.select(".x-axis-2").attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", 15)
            .style("text-anchor", "end")
            .attr("x", function(d){
                return 0;
            })
            .attr("y", 10);
    
        svg.select(".x-axis-2")
            .selectAll(".tick line")
            .style("stroke", "black")
            .style("stroke-width", "2px")
        
        xAxisTitle
            .transition()
            .duration(500)
            .text(function() {
                if (language == "en")
                    return "Week report received";
                else
                    return "Semaine des rapports reçus";
            });  
        
        let yMax = [];
        data.map(function(d) {
                yMax.push(Number(d[keys1[0]]) + Number(d[keys1[1]]));
        })
        
        if(measure == "total")
            y.domain([0, d3.max(yMax) + 2100]);
        else
            y.domain([0, d3.max(yMax) + 150]);
        
        svg.select(".y-axis-2")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y).ticks(5))
            .selectAll(".tick")
            .style("font-size", 14)
            .select("line")
            .style("font-size", 12)
            .attr('x2', width);
    
        svg.select(".y-axis-2")
            .selectAll("text")
            .style("font-size", 15)
        
        yAxisTitle
            .transition()
            .duration(500)
            .text(function() {
                if (language == "en") {
                    return short2txt(measure)+" number of reports";
                }
                else {
                    return "Nombre "+short2txt(measure)+" de rapports";
                }
            });
            
        let stack = d3.stack();

        let serie1 = svg.selectAll(".serie1")
            .data(stack.keys(keys1)(data))
            .attr("class", function(d,i) {
                return "serie1 " + selectKeys1[d.key];
            })
            // .on("click", function(d,i) {
            //     let j = i;
            //     if(i == 0)
            //         j = 1;
            //     else
            //         j = 0;
            //     if(keys1.length > 1){
            //         isolate(data, selectKeys1, d.key, svg);
            //         if(d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("text").attr("class") == "added" && d3.select(".serie1legend." + selectKeys1[d.key]).select("text").attr("class") == "removed"){
            //             d3.selectAll(".serie1legend").selectAll("text").style("fill","#333").attr("class","added");
            //             d3.selectAll(".serie1legend").selectAll("rect").attr("fill", function(d) { return z(d); }).attr("class","added");
            //         }else if(d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("text").attr("class") == "added"){
            //             d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("text").style("fill","#bfbfbf").attr("class","removed");
            //             d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("rect").attr("fill","#bfbfbf").attr("class","removed");
            //         }else{
            //             d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("text").style("fill","#333").attr("class","added");
            //             d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("rect").attr("fill", function(d) { return z(d); }).attr("class","added");
            //         }
            //     }
            // });
            
        if(measure == "rate"){
            // d3.select("#overlapRect").transition().duration(500).style("opacity",0);
            d3.select(".legendG").transition().duration(500).style("opacity",0);
            d3.select(".y-axis-3").transition().duration(500).style("opacity",0);
            d3.select(".y-axis-title-3").transition().duration(500).style("opacity",0);
            //change the left hand axis
            yAxisTitle.transition().duration(500).text(function(){
                if(language == "en")
                    return "Reports per 100,000 doses administered";
                else
                    return "Rapports pour 100 000 doses administrées";
                });
            
            svg.select(".y-axis-2")
                .transition()
                .duration(500)
                .call(d3.axisLeft(y2).ticks(6))
                .selectAll(".tick")
                .style("font-size", 14)
                .select("line")
                .style("font-size", 24)
                .attr('x2', width);
            
            svg.select(".y-axis-2")
                .selectAll("text")
                .style("font-size", 15)
            
            let bars = serie1.selectAll("rect")
                .data(function(d) { return d; })
                .transition()
                .duration(700)
                .attr("y", 390)
                .attr("height", 0)
                .selectAll("title")
                .text(function(d,i){
                    return legendJSON[this.parentNode.parentNode.__data__.key] + ": " + d.data[this.parentNode.parentNode.__data__.key];
                });
        } else {
            let bars = serie1.selectAll("rect")
                .data(function(d) { return d; })
                .transition()
                .duration(700)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); })
                .selectAll("title")
                .text(function(d,i){
                    return legendJSON[this.parentNode.parentNode.__data__.key] + ": " + d.data[this.parentNode.parentNode.__data__.key];
                });
        }
        
        legend = d3.selectAll(".legendG")
            .selectAll("g")
            .data(keys1.slice().reverse())
            .attr("class",function(d,i){
                return "serie1legend " + selectKeys1[d];
            })
            
        // legend.selectAll("rect")
            // .on("click", function(d,i) {
            //     let j = i;
            //     if(i == 0)
            //         j = 1;
            //     else
            //         j = 0;
            //     if(keys1.length > 1){
            //         isolate(data, selectKeys1, d, svg);
            //         if(d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").attr("class") == "added" && d3.select(".serie1legend." + selectKeys1[d]).select("text").attr("class") == "removed"){
            //             d3.selectAll(".serie1legend").selectAll("text").style("fill","#333").attr("class","added");
            //             d3.selectAll(".serie1legend").selectAll("rect").attr("fill", function(d) { return z(d); }).attr("class","added");
            //         }else if(d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").attr("class") == "added"){
            //             d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").style("fill","#bfbfbf").attr("class","removed");
            //             d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("rect").attr("fill","#bfbfbf").attr("class","removed");
            //         }else{
            //             d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").style("fill","#333").attr("class","added");
            //             d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("rect").attr("fill", function(d) { return z(d); }).attr("class","added");
            //         }
            //     }
            // });
            
        // legend.selectAll("text")
        //     .on("click", function(d,i) {
        //         let j = i;
        //         if(i == 0)
        //             j = 1;
        //         else
        //             j = 0;
        //         if(keys1.length > 1){
        //             isolate(data, selectKeys1, d, svg);
        //             if(d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").attr("class") == "added" && d3.select(".serie1legend." + selectKeys1[d]).select("text").attr("class") == "removed"){
        //                 d3.selectAll(".serie1legend").selectAll("text").style("fill","#333").attr("class","added");
        //                 d3.selectAll(".serie1legend").selectAll("rect").attr("fill", function(d) { return z(d); }).attr("class","added");
        //             }else if(d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").attr("class") == "added"){
        //                 d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").style("fill","#bfbfbf").attr("class","removed");
        //                 d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("rect").attr("fill","#bfbfbf").attr("class","removed");
        //             }else{
        //                 d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").style("fill","#333").attr("class","added");
        //                 d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("rect").attr("fill", function(d) { return z(d); }).attr("class","added");
        //             }
        //         }
        //     });
    }
    
}
function figure2(data) {
    data.forEach(function(d){
        d["Vaccine trade name"] = short2txt(d["Vaccine trade name"]);
    })
    
    var currentDate = data.length - 1;
    var currentDate2 = data[currentDate]["Data cut off date"];
    var dataCurrentDate = data.filter(function(d){ return d["Data cut off date"] == currentDate2});
    dataCurrentDate = dataCurrentDate.filter(function(d){ return d["Vaccine trade name"] !== "Total";});
    
    let tableB = d3.select("#figure2Table");
    
    tableB
        .append("tbody")
        .selectAll("tr")
        .data(dataCurrentDate)
        .enter()
        .append("tr")
        .html(function(d){
            if(language == "en")
                return "<td>"+d["Vaccine trade name"]+"</td><td>"+numberFormat(d["Non-serious reports"])+"</td>"+"<td>"+numberFormat(d["Serious reports"])+"</td><td>"+numberFormat(d["Total reports"])+"</td><td>"+numberFormat(d["Number of doses administered"]).replace("NaN","N/A")+"</td><td>"+decimalFormat(d["Non-serious rate"]).replace("NaN","N/A")+"</td><td>"+decimalFormat(d["Serious rate"]).replace("NaN","N/A")+"</td><td>"+decimalFormat(d["Total rate"]).replace("NaN","N/A")+"</td>";
            else
                return "<td>"+d["Vaccine trade name"]+"</td><td>"+numberFormat(d["Non-serious reports"])+"</td>"+"<td>"+numberFormat(d["Serious reports"])+"</td><td>"+numberFormat(d["Total reports"])+"</td><td>"+numberFormat(d["Number of doses administered"]).replace("NaN","N/A").replace("N/A","s.o.")+"</td><td>"+decimalFormat(d["Non-serious rate"]).replace("NaN","s.o.")+"</td><td>"+decimalFormat(d["Serious rate"]).replace("NaN","s.o.")+"</td><td>"+decimalFormat(d["Total rate"]).replace("NaN","s.o.")+"</td>";
        });
    
    updateTime();
    updateVaccineTypeUpdates();
    
    function updateTime(){
        var formatTime = d3.timeFormat("%B %-d, %Y");
        var formatTime2 = d3.timeFormat("%B %-d, %Y, %-I %p EDT");
        var formatTime3 = d3.timeFormat("%Y-%m-%d");
        var parseTime = d3.timeParse("%Y-%m-%d");
        var parseTime2 = d3.timeParse("%Y-%m-%d %H:%M");
        
        var oneDayMillis = 1000*60*60*24;
        var sevenDaysBefore = new Date(parseTime(data[currentDate]["Data cut off date"]) - (6 * oneDayMillis));
        $(".dateFromAgeSex").text(formatTime(sevenDaysBefore));
        $(".dateToShortAgeSex").text(formatTime(parseTime(data[currentDate]["Data cut off date"])));
        $(".dateToLong").text(formatTime2(parseTime2(data[0]["DateTo"])));
        $(".dateWeekAgeSex").text(data[currentDate]["Week"]);
        $(".dateModifiedAgeSex").text(formatTime3(parseTime(data[currentDate]["Data cut off date"])));
    }
    
    function updateVaccineTypeUpdates(){
        let sortedVacTypeData = data.sort(function(a, b) {
            return parseFloat(b.SeriousAEFIs) - parseFloat(a.SeriousAEFIs);
        });
        var totalAEFIReportsNonSerious = d3.sum(data,function(d,i){ return d["Non-serious reports"]; });
        var totalAEFIReportsSerious = d3.sum(data,function(d,i){ return d["Serious reports"]; });
        var totalAEFIReports = totalAEFIReportsNonSerious + totalAEFIReportsSerious;
        var firstHighestVacType = sortedVacTypeData[0]
        var secondHighestVacType = sortedVacTypeData[1]
        var thirdHighestVacType = sortedVacTypeData[2]
        
        $(".firstHighestVacType").text(""+firstHighestVacType["Vaccine trade name"]+"; ("+(firstHighestVacType["Non-serious reports"]+firstHighestVacType["Serious reports"])+" of "+totalAEFIReports+")");
        $(".secondHighestVacType").text(""+secondHighestVacType["Vaccine trade name"]+"; ("+(secondHighestVacType["Non-serious reports"]+secondHighestVacType["Serious reports"])+" of "+totalAEFIReports+")");

        $(".highestRateVacType").text("");
        $(".highestNumberOfAEFIReports").text(""+firstHighestVacType["Vaccine trade name"]);
    }
    
    let parseTimeFigure1 = d3.timeParse("%Y-%m-%d")

    var legendJSONAgeSex = {};
        if(language == "en"){
            legendJSON = {
                "Serious reports": "Serious",
                "Non-serious reports": "Non-Serious"
            };
        }else {
            legendJSON = {
                "Serious reports": "Grave",
                "Non-serious reports": "Sans gravité"
            };
        }
        keys1 = ["Non-serious reports","Serious reports"];
        selectKeys1 = {
                "Serious reports":"SeriousAEFIs",
                "Non-serious reports":"NonSeriousAEFIs"
            }
        colors = ["#8c96c6","#88419d"];
        var svg = d3.select("#figure2");

        const margin = {
            top: 100,
            right: 20,
            bottom: 100,
            left: 105
        };

        let isIE = /*@cc_on!@*/ false || !!document.documentMode;
        if (/Edge\/\d./i.test(navigator.userAgent))
            isIE = true;

        let width = 1140 - margin.left - margin.right;
        let height = 530 - margin.top - margin.bottom;

        svg = svg
            .attr("width", function(d) {
                if (isIE) {
                    return (width + margin.left + margin.right);
                }
                else {
                    return;
                }
            })
            .attr("height", function(d) {
                if (isIE) {
                    return (height + margin.top + margin.bottom);
                }
                else {
                    return;
                }
            })
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", function(d){ 
                    return "0 40 1140 500";})
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
                
        let selectedBreakdown = null;
        
        var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);

        var y = d3.scaleLinear()
            .range([height, 0]);

        var z = d3.scaleOrdinal()
            .range(colors);

        svg.append("g")
            .attr("class", "y-axis-2");
    
        svg.append("g")
            .attr("class", "x-axis-2");

        let xAxisTitle = svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top - 40) + ")")
            .style("text-anchor", "middle")
            .style("font-size","22px")
            .attr("class", "x-axis-title-2");

        let yAxisTitle = svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", - 5 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size","21px")
            .attr("class", "y-axis-title-2");
    
        x.domain(dataCurrentDate.map(function(d) {
            return d["Vaccine trade name"];
        }));

        z = d3.scaleOrdinal()
        .range(colors);
    
        z.domain([]);
        
        svg.select(".x-axis-2").attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", function(){
                    return 19;
            })
            .style("text-anchor", "middle")
            .attr("x", function(d){
                    return 0;
            })
            .attr("y", function(d){
                    return 10;
            });

        svg.select(".x-axis-2")
            .selectAll(".tick line")
            .style("stroke", "black")
            .style("stroke-width", "2px");
    
        xAxisTitle
            .transition()
            .duration(500)
            .text(function() {
                if (language == "en") {
                    return "Vaccine name";
                }
                else {
                    return "Nom du vaccin";
                }
            });
        
        y.domain([0, Math.ceil(d3.max(dataCurrentDate,function(d){
            return +d["Non-serious reports"];
        }) * 2) ]); 
        
        svg.select(".y-axis-2")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y).ticks(5))
            .selectAll(".tick")
            .style("font-size", 14)
            .select("line")
            .style("font-size", 12)
            .attr('x2', width)
            .selectAll("text")
            .style("font-size", 15)

        svg.select(".y-axis-2")
            .selectAll("text")
            .style("font-size", 15)
    
        yAxisTitle
            .transition()
            .duration(500)
            .text(function() {
                if (language == "en")
                    return "Number of reports";
                else
                    return "Nombre de rapports";
            });    

        let stack = d3.stack();
            
        svg.selectAll(".serie1")
            .data(stack.keys(keys1)(dataCurrentDate))
            .enter()
            .append("g")
            .attr("class", function(d,i) {
                return "serie1 " + selectKeys1[d.key];
            })
            .on("click", function(d) {
                if(keys1.length > 1)
                    isolate(dataCurrentDate, selectKeys1, d.key, svg);
            })
            .attr("fill", function(d) { return z(d.key); })
            .selectAll("rect")
            .data(function(d){
                return d;
            })
            .enter()
            .append("rect")
            .attr("x", function(d) {
                if(x.bandwidth() > width/4)
                    return x(d.data["Vaccine trade name"]) + 50;
                else
                    return x(d.data["Vaccine trade name"]) + 10;
                })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width", function(d){
                if(x.bandwidth() > width/5)
                    return width/5;
                else
                    return x.bandwidth();
                })
            .append("title")
            .text(function(d,i){
                
                return legendJSON[this.parentNode.parentNode.__data__.key] + ": " + d.data[this.parentNode.parentNode.__data__.key];
            });
        
        var legend = svg.append("g")
            .attr("class","legendG")
            .attr("font-family", "sans-serif")
            .attr("font-size", "22px")
            .attr("text-anchor", "start")
            .attr("transform","translate(-965,0)")
            .selectAll("g")
            .data(keys1.reverse().slice())
            .enter().append("g")
            .attr("transform", function(d,i) { return "translate("+ ((((width - margin.left) - 750) * i) + 890) + "," +  0 + ")"; });
     
        legend.append("rect")
            .attr("x", 430)
            .attr("y", 400)
            .attr("width",19)
            .attr("height",19)
            .on("click", function(d) {
            if(keys1.length > 1)
                isolate(dataCurrentDate, selectKeys1, d, svg);
            })
            .attr("fill", function(d) { return z(d); })
            .style("stroke-width", "0.5px")
            .style("stroke", "black");
        
        legend.append("text")
            .attr("x", 460)
            .attr("y", 410)
            .attr("dy", "0.4em")
            .text(function(d) { return legendJSON[d]; });
            
        $("#figure2-dropdown-measure").on("change", function(e) {
            let measure = document.getElementById('figure2-dropdown-measure');
            updateFigure2(data,measure.options[measure.selectedIndex].value);
        }); 
        
    function isolate(data, keys1, key, svg) {
        if (selectedBreakdown != null ) {
            
            let stack = d3.stack();
            let stacked = stack.keys(Object.keys(keys1).sort())(data);
        
            svg.selectAll(".serie1")
            .data(stacked)
            .selectAll("rect")
            .data(function(d){
                return d;
            })
            .transition()
            .duration(500)
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .style("opacity", 1);
            
            selectedBreakdown = null;
        } else {
            selectedBreakdown = keys1[key];
        
            svg.select("." + selectedBreakdown).selectAll("rect")
                .transition()
                .duration(500)
                .attr("y", function(d) {
                    return y(d.data[key]);
                });
            
            svg.selectAll(".serie1:not(." + selectedBreakdown + ")")
                .selectAll("rect")
                .transition()
                .duration(500)
                .style("opacity", 0);
        }
    }
    function updateFigure2(data,measure){
        var parseTimeFigure1;
    
        var legendJSON = {};
        var keys1 = [];
        var colors = [];
        var svg;
        var filteredData;
        
        parseTimeFigure1 = d3.timeParse("%Y-%m-%d")
            if(measure == "number"){
                if(language == "en"){
                    legendJSON = {
                        "Serious reports": "Serious",
                        "Non-serious reports": "Non-Serious"
                    };
                }else {
                    legendJSON = {
                        "Serious reports": "Grave",
                        "Non-serious reports": "Sans gravité"
                    };
                }
                keys1 = ["Non-serious reports","Serious reports"];
                selectKeys1 = {
                        "Serious reports":"SeriousAEFIs",
                        "Non-serious reports":"NonSeriousAEFIs"
                }
                filteredData = dataCurrentDate;
            } else {
                if(language == "en"){
                    legendJSON = {
                        "Serious rate": "Serious",
                        "Non-serious rate": "Non-Serious"
                    };
                }else {
                    legendJSON = {
                        "Serious rate": "Grave",
                        "Non-serious rate": "Sans gravité"
                    };
                }
                keys1 = ["Non-serious rate","Serious rate"];
                selectKeys1 = {
                        "Serious rate":"SeriousAEFIs",
                        "Non-serious rate":"NonSeriousAEFIs"
                    }
                filteredData = dataCurrentDate.filter(function(d){
                    return d["Vaccine trade name"] !== "Unknown" && d["Vaccine trade name"] !== "Inconnu";
                });
            }
        colors = ["#8c96c6","#88419d"];
        svg = d3.select("#figure2");
        
        x.domain(filteredData.map(function(d) {
                return d["Vaccine trade name"];
        }));
        
        z.domain(keys1);
    
        svg.select(".x-axis-2").attr("transform", "translate(0," + height + ")")
            .transition()
            .duration(700)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", "19px")
            .style("text-anchor", "middle")
            .attr("x", function(d){
                return 0;
            })
            .attr("y", 10);
        
        svg.select(".x-axis-2")
            .selectAll(".tick line")
            .style("stroke", "black")
            .style("stroke-width", "2px");
            
        if(measure == "number")
             y.domain([0, Math.ceil(d3.max(dataCurrentDate,function(d){
                return +d["Non-serious reports"];
            }) * 2) ]);
        else
            y.domain([0, Math.ceil(d3.max(dataCurrentDate,function(d){
                return +d["Non-serious rate"];
            }) * 2) ]);
            
        svg.select(".y-axis-2")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y).ticks(5))
            .selectAll(".tick")
            .style("font-size", 14)
            .select("line")
            .style("font-size", 12)
            .attr('x2', width);
    
        svg.select(".y-axis-2")
            .selectAll("text")
            .style("font-size", 15)
        
        yAxisTitle
            .text(function() {
                if(measure == "number")
                    if (language == "en") {
                        return "Number of reports";
                    }
                    else {
                        return "Nombre de rapports";
                    }
                else
                    if (language == "en") {
                        return "Rate of reports per 100,000 doses administered";
                    }
                    else {
                        return "Taux de rapports d’effets secondaires par 100,000 doses administrées";
                    }
            }).call(wrapVertical,300);

            let serie1 = svg.selectAll(".serie1")
                .data(stack.keys(keys1)(filteredData))
                .attr("class", function(d,i) {
                    return "serie1 " + selectKeys1[d.key];
                });
            serie1.selectAll("rect")
                .transition()
                .duration(600)
                .style("opacity", function(d){
                    if((d.data["Vaccine trade name"] == "Unknown" || d.data["Vaccine trade name"] == "Inconnu") && measure == "rate")
                        return 0;
                    return 1;
                });
                
            let bars = serie1.selectAll("rect")
                .data(function(d) { return d; })
                .transition()
                .duration(700)
                .style("opacity", 1)
                .attr("x",function(d){
                    if(measure == "number")
                        return x(d.data["Vaccine trade name"]);
                    else
                        return x(d.data["Vaccine trade name"]) + 40;
                })
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); })
                .selectAll("title")
                .text(function(d,i){
                    return legendJSON[this.parentNode.parentNode.__data__.key] + ": " + d.data[this.parentNode.parentNode.__data__.key];
                });
        }
}
function figure3(data){
    var currentDate = data.length - 1;
    var currentDate2 = data[currentDate]["Data cut off date"];
    var dataCurrentDate = data.filter(function(d){ return d["Data cut off date"]  == currentDate2});
    
    let table = d3.select("#figure3Table");
    
    table
        .append("tbody")
        .selectAll("tr")
        .data(dataCurrentDate.filter(function(d){
            return d["Total reports"] !== "";
        }))
        .enter()
        .append("tr")
        .attr("id",function(d){
            if(d["Age group"] == "Total")
                return "allAgeGroup"
            return ""
        })
        .html(function(d){
            if(d["Age group"] == "Total")
                return "<td>"+"All age groups"+"</td><td>"+d["Total reports"]+"</td><td>"+d["Male reports"]+"</td><td>"+d["Female reports"]+"</td><td>"+d["Other reports"]+"</td><td>"+d["Unknown reports"]+"</td><td>"+numberFormat(d["Doses administered (Age groups)"])+"</td><td>"+numberFormat(d["Doses administered (Male)"])+"</td><td>"+numberFormat(d["Doses administered (Female)"])+"</td><td>"+numberFormat(d["Rate per 100,000 doses administered (Age groups)"])+"</td><td>"+numberFormat(d["Doses administered (Male and Female)"])+"</td><td>"+d["Rate per 100,000 doses administered (Male)"]+"</td><td>"+d["Rate per 100,000 doses administered (Female)"]+"</td><td>"+d["Rate per 100,000 doses administered (Male and Female)"]+"</td>";
            else
                if(language == "en")
                    if(d["Age group"] == "0 to 17")
                        return "<td>"+d["Age group"]+"<sup>3</sup></td><td>"+numberFormat(d["Total reports"])+"</td><td>"+numberFormat(d["Male reports"])+"</td><td>"+numberFormat(d["Female reports"])+"</td><td>"+numberFormat(d["Other reports"])+"</td><td>"+numberFormat(d["Unknown reports"])+"</td><td>"+numberFormat(d["Doses administered (Age groups)"])+"</td><td>"+numberFormat(d["Doses administered (Male)"])+"</td><td>"+numberFormat(d["Doses administered (Female)"])+"</td><td>"+numberFormat(d["Doses administered (Male and Female)"])+"</td><td>"+d["Rate per 100,000 doses administered (Age groups)"]+"</td><td>"+d["Rate per 100,000 doses administered (Male)"]+"</td><td>"+d["Rate per 100,000 doses administered (Female)"]+"</td><td>"+d["Rate per 100,000 doses administered (Male and Female)"]+"</td>";
                    else
                        return "<td>"+d["Age group"]+"</td><td>"+numberFormat(d["Total reports"])+"</td><td>"+numberFormat(d["Male reports"])+"</td><td>"+numberFormat(d["Female reports"])+"</td><td>"+numberFormat(d["Other reports"])+"</td><td>"+numberFormat(d["Unknown reports"])+"</td><td>"+numberFormat(d["Doses administered (Age groups)"]).replace("NaN","N/A")+"</td><td>"+numberFormat(d["Doses administered (Male)"]).replace("NaN","N/A")+"</td><td>"+numberFormat(d["Doses administered (Female)"]).replace("NaN","N/A")+"</td><td>"+numberFormat(d["Doses administered (Male and Female)"]).replace("NaN","N/A")+"</td><td>"+d["Rate per 100,000 doses administered (Age groups)"]+"</td><td>"+d["Rate per 100,000 doses administered (Male)"]+"</td><td>"+d["Rate per 100,000 doses administered (Female)"]+"</td><td>"+d["Rate per 100,000 doses administered (Male and Female)"]+"</td>";
                else
                    if(d["Age group"] == "0 to 17")
                        return "<td>"+d["Age group"].replace("to","à").replace("Unknown","Inconnu")+"<sup>3</sup></td><td>"+numberFormat(d["Total reports"])+"</td><td>"+numberFormat(d["Male reports"])+"</td><td>"+numberFormat(d["Female reports"])+"</td><td>"+numberFormat(d["Other reports"])+"</td><td>"+numberFormat(d["Unknown reports"])+"</td><td>"+numberFormat(d["Doses administered (Age groups)"])+"</td><td>"+numberFormat(d["Doses administered (Male)"])+"</td><td>"+numberFormat(d["Doses administered (Female)"])+"</td><td>"+numberFormat(d["Doses administered (Male and Female)"])+"</td><td>"+decimalFormat(d["Rate per 100,000 doses administered (Age groups)"])+"</td><td>"+decimalFormat(d["Rate per 100,000 doses administered (Male)"])+"</td><td>"+decimalFormat(d["Rate per 100,000 doses administered (Female)"])+"</td><td>"+decimalFormat(d["Rate per 100,000 doses administered (Male and Female)"])+"</td>";
                    else
                        return "<td>"+d["Age group"].replace("to","à").replace("Unknown","Inconnu")+"</td><td>"+numberFormat(d["Total reports"])+"</td><td>"+numberFormat(d["Male reports"])+"</td><td>"+numberFormat(d["Female reports"])+"</td><td>"+numberFormat(d["Other reports"])+"</td><td>"+numberFormat(d["Unknown reports"])+"</td><td>"+numberFormat(d["Doses administered (Age groups)"]).replace("NaN","s.o.")+"</td><td>"+numberFormat(d["Doses administered (Male)"]).replace("NaN","s.o.")+"</td><td>"+numberFormat(d["Doses administered (Female)"]).replace("NaN","s.o.")+"</td><td>"+numberFormat(d["Doses administered (Male and Female)"]).replace("NaN","s.o.")+"</td><td>"+decimalFormat(d["Rate per 100,000 doses administered (Age groups)"]).replace("NaN","s.o.")+"</td><td>"+decimalFormat(d["Rate per 100,000 doses administered (Male)"]).replace("NaN","s.o.")+"</td><td>"+decimalFormat(d["Rate per 100,000 doses administered (Female)"]).replace("NaN","s.o.")+"</td><td>"+decimalFormat(d["Rate per 100,000 doses administered (Male and Female)"]).replace("NaN","s.o.")+"</td>";

        });
    d3.select("#allAgeGroup").remove();
    
    updateTime();
    updateAgeSexUpdates();
    
    function updateTime(){
        var formatTime = d3.timeFormat("%B %-d, %Y");
        var formatTime2 = d3.timeFormat("%B %-d, %Y, %-I %p EDT");
        var formatTime3 = d3.timeFormat("%Y-%m-%d");
        var parseTime = d3.timeParse("%Y-%m-%d");
        var parseTime2 = d3.timeParse("%Y-%m-%d %H:%M");
        
        var oneDayMillis = 1000*60*60*24;
        var sevenDaysBefore = new Date(parseTime(data[currentDate]["Data cut off date"]) - (6 * oneDayMillis));
        $(".dateFromAgeSex").text(formatTime(sevenDaysBefore));
        $(".dateToShortAgeSex").text(formatTime(parseTime(data[currentDate]["Data cut off date"])));
        $(".dateToLong").text(formatTime2(parseTime2(data[0]["DateTo"])));
        $(".dateWeekAgeSex").text(data[currentDate]["Week"]);
    }
    
    function updateAgeSexUpdates(){
        var dataCurrentDateAge = dataCurrentDate.filter(function(d){ return d["Age group"] != "Total";});
        var highestAgeGroupArray = d3.max(dataCurrentDateAge,function(d,i){ return parseFloat(d["Total reports"]); });
        var highestAgeGroupIndex = maxIndex(dataCurrentDateAge.map(function(d,i){ return parseFloat(d["Total reports"]); }));
        
        if(dataCurrentDateAge[highestAgeGroupIndex]["Age group"]=="18 to <50"){
            var highestAgeGroup = "18 to 49";
        }else {
            var highestAgeGroup = dataCurrentDateAge[highestAgeGroupIndex]["Age group"];
        }
        if(language == "fr")
            highestAgeGroup = highestAgeGroup.replace("to","à") + " ans";
        
        var dataCurrentDateTotal = dataCurrentDate.filter(function(d){ return d["Age group"] == "Total";});
        var sexTotalAEFIs = +dataCurrentDateTotal[0]["Total reports"];
        var femaleAEFIs = +dataCurrentDateTotal[0]["Female reports"];
        var maleAEFIs = +dataCurrentDateTotal[0]["Male reports"];
        var highestSex; 
        var lowestSex; 
        if(language == "en"){
            if(femaleAEFIs > maleAEFIs){
                highestSex = "females";
                lowestSex = "males";
            }else{
                highestSex = "males";
                lowestSex = "females";
            }
        }else{
            if(femaleAEFIs > maleAEFIs){
                highestSex = "femmes";
                lowestSex = "hommes";
            }else {
                highestSex = "hommes";
                lowestSex = "femmes";
            }
        }
        
        $(".highestAgeGroup").text(highestAgeGroup);
        $(".highestSex").text(highestSex);
        $(".lowestSex").text(lowestSex);
        $(".percentHighestSex").text(d3.format(".1f")((femaleAEFIs / sexTotalAEFIs) * 100));
        
        var dataCurrentDateUnder18 = dataCurrentDate.filter(function(d){ return (d["Age group"] != "Total") && (d["Age group"] != "18 to <65 years") && (d["Age group"] != "65+ years");});
        var dataCurrentDateOver18 =  dataCurrentDate.filter(function(d){ return (d["Age group"] == "18 to <65 years") || (d["Age group"] == "65+ years");});
        var totalGenderUnder18 = d3.sum(dataCurrentDateUnder18,function(d,i){ return d["Total reports"]; });
        var totalGenderOver18 = d3.sum(dataCurrentDateOver18,function(d,i){ return d["Total reports"]; });
        var malesUnder18 = d3.sum(dataCurrentDateUnder18,function(d,i){ return d["Male reports"]; });
        var malesOver18 = d3.sum(dataCurrentDateOver18,function(d,i){ return d["Male reports"]; });
        var femalesUnder18 = d3.sum(dataCurrentDateUnder18,function(d,i){ return d["Female reports"]; });
        var femalesOver18 = d3.sum(dataCurrentDateOver18,function(d,i){ return d["Female reports"]; });
        
        var highestSexUnder18; 
        var highestSexOver18; 
        if(language == "en"){
            if(femalesUnder18 > malesUnder18){
                highestSexUnder18 = "females";
            }else{
                highestSexUnder18 = "males";
            }
            if(femalesOver18 > malesOver18){
                highestSexOver18 = "females";
            }else{
                highestSexOver18 = "males";
            }
        }else{
            if(femalesUnder18 > malesUnder18){
                highestSexUnder18 = "femmes";
            }else {
                highestSexUnder18 = "hommes";
            }
            if(femalesOver18 > malesOver18){
                highestSexOver18 = "femmes";
            }else {
                highestSexOver18 = "hommes";
            }
        }
        
        $(".highestSexUnder18").text(highestSexUnder18);
        if(femalesUnder18 > malesUnder18){
            $(".percentHighestSexUnder18").text(d3.format(".1f")(((femalesUnder18) / totalGenderUnder18) * 100));
        }else {
            $(".percentHighestSexUnder18").text(d3.format(".1f")(((malesUnder18) / totalGenderUnder18) * 100));
        }
        
        $(".highestSexOver18").text(highestSexOver18);
        if(femalesOver18 > malesOver18){
            $(".percentHighestSexUnder18").text(d3.format(".1f")(((femalesOver18) / totalGenderUnder18) * 100));
        }else {
            $(".percentHighestSexUnder18").text(d3.format(".1f")(((malesOver18) / totalGenderUnder18) * 100));
        }
    }
    var legendJSONCategory;
    
    if(language == "en"){
        legendJSONCategory = {"Male reports":"Male",
         "Female reports":"Female",
         "Other reports":"Other",
         "Unknown reports":"Unknown"};
    } else {
         legendJSONCategory = {"Male reports":"Hommes",
         "Female reports":"Femmes",
         "Other reports":"Autre",
         "Unknown reports":"Inconnu"};
    }
    let selectKeysCategory = {};
    let keysCategory = [];
    let colors = [];
    
    keysCategory = ["Male reports","Female reports","Other reports","Unknown reports"];
    selectKeysCategory = {
        "Male reports": "Male",
        "Female reports": "Female",
        "Other reports": "Other",
        "Unknown reports":"Unknown"
    }
    colors = ["#810f7c","#b3cde3","#8c96c6","#8856a7"];
 
    let keysBars = ["Male reports","Female reports","Other reports","Unknown reports"];
    let AEFIKeys = [];
    
    svg = d3.select("#figure3div").select("#figure3");
    
    if(language=="en"){
        var marginLeft = 130;
    }else{
        var marginLeft = 150;
    }
            
    const margin = {
        top: 30,
        right: 20,
        bottom: 80,
        left: marginLeft
    };

    let isIE = /*@cc_on!@*/ false || !!document.documentMode;
    if (/Edge\/\d./i.test(navigator.userAgent))
        isIE = true;

    let width = 1140 - margin.left - margin.right;
    let height = 540 - margin.top - margin.bottom;

    svg = svg
        .attr("width", function(d) {
            if (isIE) {
                return (width + margin.left + margin.right);
            }
            else {
                return;
            }
        })
        .attr("height", function(d) {
            if (isIE) {
                return (height + margin.top + margin.bottom);
            }
            else {
                return;
            }
        })
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1140 580")
        .append("g")
        .attr("id","graphG")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    let y = d3.scaleBand()
        .range([0, height])
        .padding(0.3);

    let x = d3.scaleLinear()
        .range([0, width - margin.right]);

    var z = d3.scaleOrdinal()
        .range(colors);

    svg.append("g")
        .attr("class", "y-axis-3");

    svg.append("g")
        .attr("class", "x-axis-3");

    let xAxisTitle = svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 40) + ")")
        .style("text-anchor", "middle")
        .attr("class", "x-axis-title-3")
        .style("font-size", "18px");

    let yAxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", - 5 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title-3")
        
    
    let selectedBreakdown = null;
    let xMax = [];
    dataCurrentDate.map(function(d) {
        if(!isNaN(d["Total reports"]) && d["Age group"] != "Total"){
            xMax.push(+d["Total reports"]);
        }
    })
    let max = d3.max(xMax);
    let maxPow = Math.floor(Math.log10(max));
    let max2;
    if(max != 0){
    	max2 = Math.ceil(max/Math.pow(10,maxPow)) * Math.pow(10,maxPow);
    }else{
    	max2 = 0;
    }
    x.domain([0, max2]);
    
    dataCurrentDate = dataCurrentDate.filter(function(d){
        return d["Age group"] !== "Total";
    });
    
    y.domain(dataCurrentDate.map(function(d) {
        return d["Age group"];
    }));
    
    z.domain(keysBars);
    
    var xAxis = svg.select(".x-axis-3").attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
        
    xAxis
        .selectAll(".tick line")
        .attr("transform", "rotate(-180)")
        .attr('y2', height);
        
    xAxis
        .selectAll(".tick text")
        .style("font-size", "20px")
        .attr("y", 10);
    
    yAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en") {
                return "Age group (years)";
            }
            else {
                return "Groupe d'âge (années)";
            }
        });  

    svg.select(".y-axis-3")
        .transition()
        .duration(500)
        .call(d3.axisLeft(y))
        .selectAll(".tick text")
        .style("font-size", "18px")
        .text(function(d,i){
            if(language == "en"){
                return d;
            }else{
                if(d == "Unknown"){
                    return "Inconnu";
                }else{
                    return d.replace("to","à");
                }
            }
        })
    
    xAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en") {
                return "Number of reports";
            }
            else {
                return "Nombre de rapports";
            }
        });
        

    let stack = d3.stack();
    
    svg.selectAll(".barAgeSex")
        .data(stack.keys(keysCategory)(dataCurrentDate))
        .enter()
        .append("g")
        .attr("class", function(d,i) {
            return "barAgeSex "+selectKeysCategory[d.key];
        })
        // .on("click", function(d) {
        //     isolate(dataCurrentDate, selectKeysCategory, d.key, svg);
        // })
        .style("opacity",0)
        .attr("fill", function(d) { return z(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("y", function(d) { return y(d.data["Age group"]); })
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { 
            if(isNaN(x(d[1]) - x(d[0])))
                return 0
            return x(d[1]) - x(d[0]); 
        })
        .attr("height", y.bandwidth())
        .append("title")
        .text(function(d,i){
            return legendJSONCategory[this.parentNode.parentNode.__data__.key] + " : " + numberFormat(d.data[this.parentNode.parentNode.__data__.key]);
        });
    
    svg.selectAll(".barAge")
        .data(stack.keys(["Total reports"])(dataCurrentDate))
        .enter()
        .append("g")
        .attr("class", function(d,i) {
            return "barAge";
        })
        .attr("fill", function(d) { return z(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("y", function(d) { return y(d.data["Age group"]); })
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) {
            if(isNaN(x(d[1]) - x(d[0])))
                return 0
            return x(d[1]) - x(d[0]); 
            
        })
        .attr("height", y.bandwidth())
        .append("title")
        .text(function(d,i){
            return "Total : " + numberFormat(d.data[this.parentNode.parentNode.__data__.key]);
        });
    
    let legendColours = d3.scaleOrdinal()
        .range(colors);
    legendColours.domain(keysBars);
    
    var legendBars = svg.append("g")
            .attr("class","legendGBars")
            .attr("font-family", "sans-serif")
            .attr("font-size", "22px")
            .attr("text-anchor", "start")
            .attr("transform","translate(-115,0)")//.attr("transform","translate("+ (-width + 125) +","+ (height + 50) +")")
            .style("opacity", 0)
            .selectAll("g")
            .data(keysBars)
            .enter().append("g")
            .attr("transform", function(d,i) { return "translate("+ (width - margin.left + 100) + "," + i * 30 + ")"; });
         
        legendBars.append("rect")
            .attr("x", 30)
            .attr("width", 24)
            .attr("height", 24)
            .attr("fill", function(d) { return legendColours(d); })
            .style("stroke-width", "0.5px")
            .style("stroke", "black")
            
        legendBars.append("text")
            .attr("x", 59)
            .attr("y", 9.5)
            .attr("dy", "0.4em")
            .text(function(d) { return legendJSONCategory[d]; });
    
    $("#figure3-dropdown-measure").on("change", function(e) {
        let measure1 = document.getElementById('figure3-dropdown-measure2');
        updateFigure3(data,this.value,measure1.options[measure1.selectedIndex].value);
    });
    $("#figure3-dropdown-measure2").on("change", function(e) {
        let measure1 = document.getElementById('figure3-dropdown-measure');
        updateFigure3(data,measure1.options[measure1.selectedIndex].value,this.value);
    }); 
        //work on isolating the bar graph
    function isolate(data, keysCategory, key, svg) {
        if (selectedBreakdown != null ) {
            
            let stack = d3.stack();
            let stacked = stack.keys(Object.keys(keysCategory))(data);
        
            svg.selectAll(".barAgeSex")
                .data(stacked)
                .selectAll("rect")
                .data(function(d){
                    return d;
                })
                .transition()
                .duration(500)
                .attr("x", function(d) { return x(d[0]); })
                .attr("width", function(d) { return x(d[1]) - x(d[0]); })
                .style("opacity", 1);
            
            selectedBreakdown = null;
        } else {
            selectedBreakdown = selectKeysCategory[key];
            svg.selectAll(".barAgeSex")
                .selectAll("rect")
                .transition()
                .duration(500)
                .attr("x", function(d) {
                    return x(0);
                });
            
            svg.selectAll(".barAgeSex:not(."+selectedBreakdown+")")
                .selectAll("rect")
                .transition()
                .duration(500)
                .style("opacity", 0);
        }
    }
    
    function updateFigure3(data, measure, measure2){
        
        var parseTimeFigure1;
    
        var keys = [];
        var colors = [];
        var svg = d3.select("#figure3");
        
        parseTimeFigure1 = d3.timeParse("%Y-%m-%d");
        
        var legendJSONAgeSex = {};
        let stack = d3.stack();
        let filteredData;
        
        if(language == "en"){
            legendJSONCategory = {"Male reports":"Male",
             "Female reports":"Female",
             "Unknown reports":"Unknown",
             "Other":"Other",
             "Rate per 100,000 doses administered (Male)":"Male reporting rate (per 100,000)",
             "Rate per 100,000 doses administered (Female)":"Female reporting rate (per 100,000)",
             "Rate per 100,000 doses administered (Male and Female)":"Total reporting rate (per 100,000)"};
            }else {
            legendJSONCategory = {"Male reports":"Hommes",
             "Female reports":"Femmes",
             "Unknown reports":"Inconnu",
             "Other":"Autre",
             "Rate per 100,000 doses administered (Male)":"Taux de signalement des hommes (par 100,000)",
             "Rate per 100,000 doses administered (Female)":"Taux de signalement des femmes (par 100,000)",
             "Rate per 100,000 doses administered (Male and Female)":"Total taux de signalement (par 100,000)"};
        }
        let xMax = [];
        if(measure2 == "number"){
            dataCurrentDate.map(function(d) {
                if(!isNaN(d["Total reports"]) && d["Age group"] != "Total"){
                    xMax.push(+d["Total reports"]);
                }
            });
        } else {
            dataCurrentDate.map(function(d) {
            if(!isNaN(d["Rate per 100,000 doses administered (Age groups)"]) && d["Age group"] != "Total"){
                xMax.push(+d["Rate per 100,000 doses administered (Age groups)"]);
            }
        });
        }
        let max = d3.max(xMax);
        let maxPow = Math.floor(Math.log10(max));
        let max2;
        if(max != 0){
        	max2 = Math.ceil(max/Math.pow(10,maxPow)) * Math.pow(10,maxPow);
        }else{
        	max2 = 0;
        }
        if(measure2 == "rate" & measure == "both")
            x.domain([0, max2 + 40]);
        else
            x.domain([0, max2]);
        
        svg.select(".x-axis-title-3")
            .transition()
            .duration(500)
            .text(function(){
                if(language == "en"){
                    if(measure2 == "number")
                        return "Number of reports";
                    else
                        return "Rate per 100,000 doses";
                }
                else {
                    if(measure2 == "number")
                        return "Nombre de rapports";
                    else
                        return "Taux pour 100 000 doses";
                }
            })
        
        let xAxis = svg.select(".x-axis-3")
            .transition()
            .duration(500)
            .call(d3.axisBottom(x));

            xAxis.selectAll(".tick line")
                .attr("transform", "rotate(-180)")
                .attr('y2', height);
            
            xAxis
                .selectAll(".tick text")
                .style("font-size", "20px")
                .attr("y", 10);
        if(measure2 == "rate"){
            filteredData = dataCurrentDate.filter(function(d){
                    return d["Age group"] !== "Unknown";
                });
            y.domain(filteredData.map(function(d) {
                return d["Age group"];
        }));
        }else{
            y.domain(dataCurrentDate.map(function(d) {
                return d["Age group"];
        }));}
        
        svg.select(".y-axis-3")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y))
            .selectAll("text")
            .text(function(d){
                if(language == "en")
                    return d;
                else
                    return d.replace("to","à");
            });
    
        svg.select(".y-axis-3")
            .selectAll("text")
            .style("font-size", 18);
            
        if(measure == "both"){
            if(measure2 == "number"){
                keysCategory = ["Male reports","Female reports","Other reports","Unknown reports"];
                svg.selectAll(".barAgeSex")
                    .data(stack.keys(keysCategory)(dataCurrentDate))
                    .selectAll("rect")
                    .data(function(d) { return d; })
                    .style("opacity",1)
                    .transition()
                    .duration(500)
                    .attr("x", function(d) { return x(d[0]); })
                    .attr("y", function(d) { return y(d.data["Age group"])})
                    .attr("width", function(d) {
                        if(isNaN(x(d[1]) - x(d[0])))
                            return 0
                        return x(d[1]) - x(d[0]); 
                        
                    })
                    .select("title")
                    .text(function(d,i){
                        return legendJSONCategory[this.parentNode.parentNode.__data__.key]+" : " + numberFormat(d.data[this.parentNode.parentNode.__data__.key]);
                    });
        }
        else if(measure2 == "rate"){
            keysCategory = ["Rate per 100,000 doses administered (Male)","Rate per 100,000 doses administered (Female)"];
            svg.selectAll(".barAgeSex")
                .data(stack.keys(keysCategory)(dataCurrentDate))
                .selectAll("rect")
                .data(function(d) { return d; })
                .style("opacity",function(d){
                    if(d.data["Age group"] == "Unknown")
                        return 0;
                    else
                        return 1;
                })
                .transition()
                .duration(500)
                .attr("x", function(d) { return x(d[0]); })
                .attr("y", function(d) { 
                    if(measure2 == "number")
                        return y(d.data["Age group"]);
                    else
                        return y(d.data["Age group"]);
                })
                .attr("width", function(d) {
                    if(isNaN(x(d[1]) - x(d[0])))
                        return 0
                    return x(d[1]) - x(d[0]); 
                    
                })
                .select("title")
                .text(function(d,i){
                    return legendJSONCategory[this.parentNode.parentNode.__data__.key]+" : " + d.data[this.parentNode.parentNode.__data__.key];
                });
        }
        } else {
            if(measure2 == "number"){
                svg.select(".barAge")
                    .data(stack.keys(["Total reports"])(dataCurrentDate))
                    .selectAll("rect")
                    .data(function(d) { return d; })
                    .style("opacity",1)
                    .transition()
                    .duration(500)
                    .attr("x", function(d) { return x(d[0]); })
                    .attr("y", function(d) { return y(d.data["Age group"])})
                    .attr("width", function(d) {
                        if(isNaN(x(d[1]) - x(d[0])))
                            return 0
                        return x(d[1]) - x(d[0]); 
                        
                    })
                    .select("title")
                    .text(function(d,i){
                        return "Total : " + numberFormat(d.data[this.parentNode.parentNode.__data__.key]);
                    });
        }
        else if(measure2 == "rate"){
            svg.select(".barAge")
                .data(stack.keys(["Rate per 100,000 doses administered (Age groups)"])(dataCurrentDate))
                .selectAll("rect")
                .data(function(d) { return d; })
                .style("opacity",function(d){
                    if(d.data["Age group"] == "Unknown")
                        return 0;
                    else
                        return 1;
                })
                .transition()
                .duration(500)
                .attr("x", function(d) { return x(d[0]); })
                .attr("y", function(d) { 
                    if(measure2 == "number")
                        return y(d.data["Age group"]);
                    else
                        return y(d.data["Age group"]);
                })
                .attr("width", function(d) {
                    if(isNaN(x(d[1]) - x(d[0])))
                        return 0
                    return x(d[1]) - x(d[0]); 
                    
                })
                .select("title")
                .text(function(d,i){
                    return "Rate (Total) : " + d.data[this.parentNode.parentNode.__data__.key];
                });
        }
        }
        
        svg = d3.select("#graphG");
        
        let selectedBreakdown = null;
        
        if(measure == "both") { 
            d3.select(".legendGBars")
                .transition()
                .duration(800)
                .style("opacity", 1);
                
            svg.selectAll(".barAge")
                .transition()
                .duration(800)
                .style("opacity",0);
                
            svg.selectAll(".barAgeSex")
                .transition()
                .duration(800)
                .style("opacity",1);
            svg.selectAll(".barAgeSex").raise()
            if(measure2 == "number"){
                svg.select(".Unknown")
                    .selectAll("rect")
                    .transition()
                    .duration(500)
                    .style("opacity",1);
                svg.select(".Other")
                    .selectAll("rect")
                    .transition()
                    .duration(500)
                    .style("opacity",1);
            }
            else {
                svg.select(".Unknown")
                    .selectAll("rect")
                    .transition()
                    .duration(500)
                    .style("opacity",0);
                svg.select(".Other")
                    .selectAll("rect")
                    .transition()
                    .duration(500)
                    .style("opacity",0);
                }
        }
        else {
            d3.select(".legendGBars")
                .transition()
                .duration(800)
                .style("opacity",0);
                
            svg.selectAll(".barAge")
                .transition()
                .duration(800)
                .style("opacity",1);
            
            svg.selectAll(".barAgeSex")
                .transition()
                .duration(800)
                .style("opacity",0);
            svg.selectAll(".barAge").raise();
        }
}
}
function figure4(data, AEFIData, severityData){
    d3.select("#total").remove();
    var currentDate = data.length - 1;
    var currentDatePrevious = currentDate;
    var currentDate2 = data[currentDate]["Data cut off date"];
    
    var AEFIDataCurrentDate = AEFIData.filter(function(d){ return d["Data cut off date"] == currentDate2;});
    var severityDataCurrentDate = severityData.filter(function(d){ return d["Data cut off date"] == currentDate2;});
    var severityDataCurrentDateArray = severityDataCurrentDate.sort(function(a,b){ return parseFloat(b["Number"]) - parseFloat(a["Number"])});
    
    var AEFIDataCurrentDateTotal = AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Total number of AEFIs";})[0];
    var dataCurrentDate = data.filter(function(d){ return d["Data cut off date"] == currentDate2});
    
    let table = d3.select("#figure4Table");
    
    table
        .append("tbody")
        .selectAll("tr")
        .data(dataCurrentDate.filter(function(d){
            return d["Total reports"] !== "";
        }))
        .enter()
        .append("tr")
        .attr("id",function(d){
            if(d["Serious adverse event outcome"] == "Total"){
                return "total";
            }else{
                return "";
            }
        })
        .html(function(d){
            if(d["Serious adverse event outcome"] == "Total"){
                return "<td>Total</td><td>"+d["Total reports"]+"</td>";
            }else{
                return "<td>"+d["Serious adverse event outcome"]+"</td><td>"+d["Total reports"]+"</td>";
            }
        });
    
    updateTimeCategory();
    updateCategory();

    function updateTimeCategory(){
        var formatTime = d3.timeFormat("%B %-d, %Y");
        var formatTime2 = d3.timeFormat("%B %-d, %Y, %-I %p EDT");
        var formatTime3 = d3.timeFormat("%Y-%m-%d");
        var parseTime = d3.timeParse("%Y-%m-%d");
        var parseTime2 = d3.timeParse("%Y-%m-%d %H:%M");
        
        var oneDayMillis = 1000*60*60*24;
        var sevenDaysBefore = new Date(parseTime(data[currentDate]["Data cut off date"]) - (6 * oneDayMillis));
        $(".dateFromCategory").text(formatTime(sevenDaysBefore));
        $(".dateToShortCategory").text(formatTime(parseTime(data[currentDate]["Data cut off date"])));
        $(".dateWeekCategory").text(data[currentDate]["Week"]);
    }
    
    function updateCategory(){
        var dataCurrentDate2 = dataCurrentDate;
        
        dataCurrentDate2 = dataCurrentDate2.filter(function(d){ return d["Serious adverse event outcome"] != "Total"});
        var commonAEFIIndex = maxIndex(dataCurrentDate2.map(function(d,i){ return parseInt(d["Total reports"]); }));
        var commonAEFI = dataCurrentDate2[commonAEFIIndex];
        var dataCurrentDateMissingMax = dataCurrentDate2.filter(function(d){ return d["Serious adverse event outcome"] != commonAEFI["Serious adverse event outcome"] && d["Serious adverse event outcome"] != "Other"; })
        var commonAEFI2Index = maxIndex(dataCurrentDateMissingMax.map(function(d,i){ return parseInt(d["Total reports"]); }));
        var commonAEFI2 = dataCurrentDate2[commonAEFI2Index];

        $(".commonAEFI").text(commonAEFI["Serious adverse event outcome"].toLowerCase());
        $(".commonAEFI2").text(commonAEFI2["Serious adverse event outcome"].toLowerCase());
        
        var AEFIReports = 0;
        var AEFISeriousReports = 0;
        var AEFINonSerious = 0;
        var deaths = 0;
        var specialInterest = 0;
        dataCurrentDate2.forEach(function(item){AEFIReports += parseInt(item["Total reports"])});

        if(language == "en"){
            if(specialInterest==0){
                $(".specialInterest").text("No adverse events of special interest (AESI) have been reported");
            }else{
                $(".specialInterest").text("["+specialInterest+"] have been reported as of <span class='dateToShort'></span>.");
            }
            if(deaths==0){
                $(".deathsReported").text("No deaths were reported.")
            }else{
                $(".deathsReported").text("["+deaths+"] have been reported (pending causality assessment).");
            }
        } else {
            if(specialInterest==0){
                $(".specialInterest").text("Aucun événement indésirable d’intérêt spécial (EIIP) n’a été signalé");
            }else{
                $(".specialInterest").text("["+specialInterest+"] événements indésirables d’intérêt spécial ont été signalés en date du <span class='dateToShort'></span>.");
            }
            if(deaths==0){
                $(".deathsReported").text("Aucun décès n’a été signalé.")
            }else{
                $(".deathsReported").text("["+deaths+"] de décès ont été signalés (en attendant l’évaluation du lien de causalité).");
            }
        }
        
        let langArticle;
        if(language == "en"){
            langArticle = "of";
        }else{
            langArticle = "de";
        }
        //all this is temp untill they change their csv format
        // let AEFI1st = "";
        // let AEFI2nd= "";
        // let AEFI3rd= "";
        // let AEFI4th= "";
        // let AEFI5th= "";
        // AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Most frequently reported AEFI (1st)"})
        // [0]["AEFI term"].split("|").forEach(function(word){
        //     AEFI1st += short2txt(word) + ", ";
        // });
        // AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Most frequently reported AEFI (2nd)"})
        // [0]["AEFI term"].split("|").forEach(function(word){
        //     AEFI2nd += short2txt(word) + ", ";
        // });
        // AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Most frequently reported AEFI (3rd)"})
        // [0]["AEFI term"].split("|").forEach(function(word){
        //     AEFI3rd += short2txt(word) + ", "; 
        // });
        // AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Most frequently reported AEFI (4th)"})
        // [0]["AEFI term"].split("|").forEach(function(word){
        //     AEFI4th += short2txt(word) + ", ";
        // });
        // AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Most frequently reported AEFI (5th)"})
        // [0]["AEFI term"].split("|").forEach(function(word,index,array){
        //     if(index == array.length-1)
        //         AEFI5th += short2txt(word);
        //     else
        //         AEFI5th += short2txt(word) + ", ";
        // });

        // if(language == "en"){
        //     $(".frequentReportedNSAE").html(
        //     "<span style='font-weight:bold;'>"+AEFI1st.toLowerCase()
        //     +"</span> <span style='font-weight:bold;'>"+AEFI2nd.toLowerCase()
        //     +"</span> <span style='font-weight:bold;'>"+AEFI3rd.toLowerCase()
        //     +"</span> <span style='font-weight:bold;'>"+AEFI4th.toLowerCase()
        //     +"</span> and <span style='font-weight:bold;'>"+AEFI5th.toLowerCase()+".");
        // } else {
        //     // $(".frequentReportedNSAE").html(
        //     // "Les effets secondaires les plus souvent signalés étaient <span style='font-weight:bold;'>"+AEFI1st
        //     // +"</span> <span style='font-weight:bold;'>"+AEFI2nd
        //     // +"</span> <span style='font-weight:bold;'>"+AEFI3rd
        //     // +"</span> <span style='font-weight:bold;'>"+AEFI4th
        //     // +"</span> <span style='font-weight:bold;'>"+AEFI5th+" and anaphylaxis.");
        // }
        // $(".numberOfSeriousReports").html(severityDataCurrentDateArray[0]["Total serious events"]);
        var listIdentifiedEvents = "";
        
        severityDataCurrentDateArray.forEach(function(d){
            listIdentifiedEvents += "<li style='font-weight:bold;'>"/*+d["Number"]+" "*/+short2txt(d["Serious adverse event"])+"</li>";
        });
        $(".listIdentifiedEvents").html(listIdentifiedEvents);
        
        // $(".listFrequentAEFIs").html(
        // "<li style='font-weight:bold;'>"+AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Most frequently reported AEFI (1st)"})[0]["AEFI term"]+" ("+AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Most frequently reported AEFI (1st)"})[0]["Frequency"]+" " + langArticle + " "+AEFIDataCurrentDateTotal["Frequency"]+")</li>"+
        // "<li style='font-weight:bold;'>"+AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Most frequently reported AEFI (2nd)"})[0]["AEFI term"]+" ("+AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Most frequently reported AEFI (2nd)"})[0]["Frequency"]+" " + langArticle + " "+AEFIDataCurrentDateTotal["Frequency"]+")</li>"+
        // "<li style='font-weight:bold;'>"+AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Most frequently reported AEFI (3rd)"})[0]["AEFI term"]+" ("+AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Most frequently reported AEFI (3rd)"})[0]["Frequency"]+" " + langArticle + " "+AEFIDataCurrentDateTotal["Frequency"]+")</li>"+
        // "<li style='font-weight:bold;'>"+AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Most frequently reported AEFI (4th)"})[0]["AEFI term"]+" ("+AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Most frequently reported AEFI (4th)"})[0]["Frequency"]+" " + langArticle + " "+AEFIDataCurrentDateTotal["Frequency"]+")</li>"+
        // "<li style='font-weight:bold;'>"+AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Most frequently reported AEFI (5th)"})[0]["AEFI term"]+" ("+AEFIDataCurrentDate.filter(function(d){ return d["Bullets"] == "Most frequently reported AEFI (5th)"})[0]["Frequency"]+" " + langArticle + " "+AEFIDataCurrentDateTotal["Frequency"]+")</li>");
    }
    
    var legendJSONCategory = {};
    var keysCategory = [];
    var colors = [];
    var svg;
    
    const parseTimeFigure3 = d3.timeParse("%Y-%m-%d")

    if(language == "en"){
        legendJSONCategory = {
            "Non-Serious Reports": "Non-Serious",
            "Serious Reports": "Serious"
        };
    }else{
        legendJSONCategory = {
            "Non-Serious Reports": "Sans gravité",
            "Serious Reports": "Graves"
        };
    }
    keysCategory = ["Total reports"];
    selectKeysCategory = {
        "Non-Serious Reports": "NonSeriousAEFIs",
        "Serious Reports": "SeriousAEFIs"
    }
    colors = ["#8c96c6","#88419d"];
    let AEFIKeys = [];
    dataCurrentDate.map(function(d,i){ if(AEFIKeys.indexOf(d["Serious adverse event outcome"]) == -1){ AEFIKeys.push(d["Serious adverse event outcome"])};})
    
    let nestedData = d3.nest()
		.key(function(d) { return d["Serious adverse event outcome"]; })
		.object(dataCurrentDate);
		
	let nestedData2 = d3.nest()
		.key(function(d) { return d["Serious adverse event outcome"]; })
		.entries(dataCurrentDate);
    
    svg = d3.select("#figure4div").select("#figure4");
    
    const margin = {
        top: 30,
        right: 20,
        bottom: 80,
        left: 250
    };

    let isIE = /*@cc_on!@*/ false || !!document.documentMode;
    if (/Edge\/\d./i.test(navigator.userAgent))
        isIE = true;

    let width = 1140 - margin.left - margin.right;
    let height = 580 - margin.top - margin.bottom;

    svg = svg
        .attr("width", function(d) {
            if (isIE) {
                return (width + margin.left + margin.right);
            }
            else {
                return;
            }
        })
        .attr("height", function(d) {
            if (isIE) {
                return (height + margin.top + margin.bottom);
            }
            else {
                return;
            }
        })
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1140 580")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    let y = d3.scaleBand()
        .range([0, height])
        .padding(0.3);

    let x = d3.scaleLinear()
        .range([0, width - margin.right]);

    var z = d3.scaleOrdinal()
        .range(colors);

    svg.append("g")
        .attr("class", "y-axis-3");

    svg.append("g")
        .attr("class", "x-axis-3");

    let xAxisTitle = svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 40) + ")")
        .style("text-anchor", "middle")
        .attr("class", "x-axis-title-3");

    let yAxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", - 5 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title-3");
    
    let selectedBreakdown = null;
    
    let xMax = [];
    dataCurrentDate.map(function(d) {
        if(!isNaN(d["Total reports"])){
            xMax.push(+d["Total reports"]);
        }
    })
    x.domain([0, d3.max(xMax) + 5]);
    
    y.domain(dataCurrentDate.map(function(d) {
        return d["Serious adverse event outcome"];
    }));

    z = d3.scaleOrdinal()
    .range(colors);
    
    z.domain(keysCategory);
    
    svg.select(".x-axis-3").attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll(".tick")
        .style("font-size", 14)
        .select("line")
        .attr("transform", "rotate(-180)")
        .style("font-size", 12)
        .attr('y2', width - 450)
        .selectAll("text")
        .style("font-size", "20px")
        .attr("y", 10);
    
    yAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en") {
                return "Serious Adverse Event Outcome";
            }
            else {
                return "Événements indésirables graves";
            }
        });  

    svg.select(".y-axis-3")
        .call(d3.axisLeft(y))
        .selectAll(".tick text")
        .attr("x",-10)
        .style("font-size", "15px");
    
    xAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en") {
                return "Number of events";
            }
            else {
                return "Nombre d'effets secondaires";
            }
        });    

    let stack = d3.stack();

    svg.selectAll(".serie3")
        .data(stack.keys(keysCategory)(dataCurrentDate))
        .enter()
        .append("g")
        .attr("class", function(d,i) {
            return "serie3 " + selectKeysCategory[d.key];
        })
        .on("click", function(d) {
            if(keysCategory.length > 1){
                isolate(dataCurrentDate, selectKeysCategory, d.key, svg);
            }
        })
        .attr("fill", function(d) { return z(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("y", function(d) { return y(d.data["Serious adverse event outcome"]); })
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("height", y.bandwidth())
        .append("title")
        .text(function(d,i){
            return d.data["Serious adverse event outcome"] + ": " + numberFormat(d.data[this.parentNode.parentNode.__data__.key]); // NEED TO FRENCH FORMATTING
        });
        
    function isolate(data, keysCategory, key, svg) {
        if (selectedBreakdown != null ) {
            
            let stack = d3.stack();
            let stacked = stack.keys(Object.keys(keysCategory).sort())(data);
        
            svg.selectAll(".serie3")
            .data(stacked)
            .selectAll("rect")
            .data(function(d){
                return d;
            })
            .transition()
            .duration(500)
            .attr("x", function(d) { return x(d[0]); })
            .attr("width", function(d) { return x(d[1]) - x(d[0]); })
            .style("opacity", 1);
            
            selectedBreakdown = null;
        } else {
            selectedBreakdown = keysCategory[key];
            
            svg.select("." + selectedBreakdown).selectAll("rect")
                .transition()
                .duration(500)
                .attr("x", function(d) {
                    return x(0);
                });
            
            svg.selectAll(".serie3:not(." + selectedBreakdown + ")")
                .selectAll("rect")
                .transition()
                .duration(500)
                .style("opacity", 0);

        }
    }
}

function figure5(data){
    var collapsedToggle = true;
    var currentDate = data.length - 1;
    var currentDatePrevious = currentDate - 1;
    var currentDate2 = data[currentDate]["Data cut off date"];
    var dataCurrentDate = data.filter(function(d){ return d["Data cut off date"] == currentDate2});
    var fullData = dataCurrentDate;
    let table = d3.select("#figure5Table");
    
    table
        .append("tbody")
        .selectAll("tr")
        .data(dataCurrentDate)
        .enter()
        .append("tr")
        .html(function(d){
            return "<td>"+short2txt(d["Total Serious and Non-serious AEFI"])+"</td><td>"+numberFormat(d["Total Serious and Non-serious AEFI Frequency"])+"</td>";
        });
    // updateTimeSeverity();
    // updateSeverity();
    
    // function updateTimeSeverity(){
    //     var formatTime = d3.timeFormat("%B %-d, %Y");
    //     var formatTime2 = d3.timeFormat("%B %-d, %Y, %-I %p EDT");
    //     var formatTime3 = d3.timeFormat("%Y-%m-%d");
    //     var parseTime = d3.timeParse("%Y-%m-%d");
    //     var parseTime2 = d3.timeParse("%Y-%m-%d %H:%M");
        
    //     var oneDayMillis = 1000*60*60*24;
    //     var sevenDaysBefore = new Date(parseTime(data[currentDate]["Data cut off date"]) - (6 * oneDayMillis));
    //     $(".dateFromSeverity").text(formatTime(sevenDaysBefore));
    //     $(".dateToShortSeverity").text(formatTime(parseTime(data[currentDate]["Data cut off date"])));
    //     $(".previousWeekSeverity").text(formatTime(parseTime(data[currentDatePrevious]["Data cut off date"])));
    //     // $(".dateToLong").text(formatTime2(parseTime2(data[0]["DateTo"])));
    //     $(".dateWeekSeverity").text(data[currentDate]["Week"]);
    // }
    
    // function updateSeverity(){
    //     var sortedSEAArray = ["Death","Hospitalization or prolongation of existing hospitalization","Life threatening","Persistent or significant disability/incapacity","Other medically important event"]
    //     .sort(function (a, b) {
    //         if (+dataCurrentDate[0][a] > +dataCurrentDate[0][b]) {
    //             return -1;
    //         }
    //         if (+dataCurrentDate[0][b] > +dataCurrentDate[0][a]) {
    //             return 1;
    //         }
    //         return 0;
    //     });
    //     var HighestSAE = sortedSEAArray[0];
    //     var HighestSAE2 = sortedSEAArray[1];
    //     var HighestSAENumber = dataCurrentDate[0][HighestSAE];
    //     var HighestSAENumber2 = dataCurrentDate[0][HighestSAE2];
        
    //     $(".HighestSAE").text(HighestSAE.toLowerCase());
    //     $(".HighestSAE2").text(HighestSAE2.toLowerCase());
    //     $(".HighestSAENumber").text(numberFormat(HighestSAENumber));
    //     $(".HighestSAENumber2").text(numberFormat(HighestSAENumber2));
    //     // var highestAEFIArray = d3.max(dataCurrentDate,function(d,i){ return d["% Serious"]; });
    //     // var highestAEFIIndex = maxIndex(dataCurrentDate.map(function(d,i){ return d["% Serious"]; }));
    //     // var mostSeriousAEFIs = dataCurrentDate[highestAEFIIndex]["Serious adverse event outcome"];
    //     // var mostSeriousAEFIsNumber = dataCurrentDate[highestAEFIIndex]["Serious Reports"];
    //     // var mostSeriousAEFIsPercent = dataCurrentDate[highestAEFIIndex]["% Serious"] * 100;
        
    //     // var dataCurrentDate2 = dataCurrentDate.filter(function(d){ return d["Serious adverse event outcome"] != mostSeriousAEFIs; });
        
    //     // var highestAEFIArray2 = d3.max(dataCurrentDate2,function(d,i){ return d["% Serious"]; });
    //     // var highestAEFIIndex2 = maxIndex(dataCurrentDate2.map(function(d,i){ return d["% Serious"]; }));
    //     // var mostSeriousAEFIs2 = dataCurrentDate2[highestAEFIIndex2]["Serious adverse event outcome"];
    //     // var mostSeriousAEFIs2Number = dataCurrentDate2[highestAEFIIndex2]["Serious Reports"];
    //     // var mostSeriousAEFIs2Percent = dataCurrentDate2[highestAEFIIndex2]["% Serious"] * 100;
        
    //     // $(".mostSeriousAEFIs").text(mostSeriousAEFIs.toLowerCase());
    //     // $(".mostSeriousAEFIsNumber").text(numberFormat(mostSeriousAEFIsNumber));
    //     // $(".mostSeriousAEFIsPercent").text(mostSeriousAEFIsPercent);
    //     // $(".mostSeriousAEFIs2").text(mostSeriousAEFIs2.toLowerCase());
    //     // $(".mostSeriousAEFIs2Number").text(numberFormat(mostSeriousAEFIs2Number));
    //     // $(".mostSeriousAEFIs2Percent").text(mostSeriousAEFIs2Percent);
    // }
    $(".figure4NValue").text(numberFormat(d3.sum(dataCurrentDate,function(d){
        if(language == "en")
            return d["Total Serious and Non-serious AEFI Frequency"];
        else
            return d["Total Serious and Non-serious AEFI Frequency"].replace(","," ");
    })));
    
    var anaphylaxis = dataCurrentDate.filter(function(d){
        return d["Total Serious and Non-serious AEFI"] == "Extensive swelling of vaccinated limb";
    });
    var blankSpacing = { "Total Serious and Non-serious AEFI Frequency": 0};
    var dataCurrentDate = dataCurrentDate.slice(0,23).concat(blankSpacing).concat(anaphylaxis);

    var svg;
    
    parseTimeFigure1 = d3.timeParse("%Y-%m-%d")

    svg = d3.select("#figure5");
    
    const margin = {
        top: 30,
        right: 20,
        bottom: 60,
        left: 320
    };

    let isIE = /*@cc_on!@*/ false || !!document.documentMode;
    if (/Edge\/\d./i.test(navigator.userAgent))
        isIE = true;

    let width = 1140 - margin.left - margin.right;
    let height = 570 - margin.top - margin.bottom;

    svg = svg
        .attr("width", function(d) {
            if (isIE) {
                return (width + margin.left + margin.right);
            }
            else {
                return;
            }
        })
        .attr("height", function(d) {
            if (isIE) {
                return (height + margin.top + margin.bottom);
            }
            else {
                return;
            }
        })
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1140 580")
        .append("g")
        .attr("class","barG")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
            
    let y = d3.scaleBand()
        .range([0, height])
        .padding(0.50);

    let x = d3.scaleLinear()
        .range([0, width - margin.right]);

    let xAxisTitle = svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 40) + ")")
        .style("text-anchor", "middle")
        .attr("class", "x-axis-title-3")
        .style("font-size", 18);

    let yAxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", - 5 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title-3")
        .style("font-size", 18);

    svg.append("g")
        .attr("class", "y-axis-2");

    svg.append("g")
        .attr("class", "x-axis-2");
    
    let selectedBreakdown = null;
    y.domain(dataCurrentDate.map(function(d) {
        if(d["Total Serious and Non-serious AEFI"] !== "")
            return short2txt(d["Total Serious and Non-serious AEFI"]);
    }));
    
    let yMax = [];
    dataCurrentDate.map(function(d) {
        if(!isNaN(d["Total Serious and Non-serious AEFI Frequency"])){
            yMax.push(+d["Total Serious and Non-serious AEFI Frequency"]);
        }
    })
    
    x.domain([0, d3.max(yMax) + 10]);
    
    svg.select(".x-axis-2")
        .attr("transform", "translate(0," + height + ")")
        .transition()
        .duration(500)
        .call(d3.axisBottom(x))
        .selectAll(".tick")
        .style("font-size", 14)
        .select("line")
        .style("font-size", 12)
        .attr('y2', -height)
        
    svg.select(".x-axis-2")
        .selectAll("text")
        .style("font-size", 15)
        .style("text-anchor","middle")
        .attr("x", function(d){
            return 0;
        })
        .attr("y", 10);
    
    xAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en") {
                return "Number of adverse events";
            }
            else {
                return "Nombre d'effets secondaires";
            }
        }); 

    svg.select(".y-axis-2")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("x",-10)
        .style("font-size", 12);

    svg.select(".y-axis-2")
        .selectAll("text")
        .style("font-size", 12)
    //Adding seperator lines
    svg.select(".y-axis-2")
        .append("g")
        .style("cursor","pointer")
        .append("line")
        .attr("class","seperators")
        .attr("x1",-13)
        .attr("x2",13)
        .attr("y1",450)
        .attr("y2",445)
        .attr("stroke","black")
        .attr("stroke-width","1.5px")
        .on("click",function(e) {
            d3.select("#figure4Toggle").dispatch('click');
        });
        
    let _seperator = svg.select(".y-axis-2")
        .append("g")
        .style("cursor","pointer")
        .on("click",function(e) {
            d3.select("#figure4Toggle").dispatch('click');
        }) ;
        
        _seperator.append("circle")
                        .attr("cx",0)
                        .attr("cy",450)
                        .attr("r",15)
                        .attr("width",26)
                        .attr("height",15)
                        .attr("fill","#cccccc")
                        .style("opacity",0)
        
        // _seperator.append("rect")
        //                 .attr("x",-13)
        //                 .attr("y",360)
        //                 .attr("width",26)
        //                 .attr("height",15)
        //                 .attr("fill","#cccccc")
        //                 .style("opacity",0.35)
     
        _seperator.append("line")
                    .attr("class","seperators")
                    .attr("x1",-13)
                    .attr("x2",13)
                    .attr("y1",445)
                    .attr("y2",440)
                    .attr("stroke","black")
                    .attr("stroke-width","1.5px")
                    // .on("click",function(e) {
                    //     d3.select("#figure4Toggle").dispatch('click');
                    // }) 
    // svg.select(".y-axis-2")
    //     .append("g")
    //     .style("cursor","pointer")
    //     .append("line")
    //     .attr("class","seperators")
    //     .attr("x1",-13)
    //     .attr("x2",13)
    //     .attr("y1",374)
    //     .attr("y2",369)
    //     .attr("stroke","black")
    //     .attr("stroke-width","1.5px")
    //     .on("click",function(e) {
    //         d3.select("#figure4Toggle").dispatch('click');
    //     })
        
        
    yAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en") {
                return "Most frequently reported adverse events";
            }
            else {
                return "Effets secondaires les plus souvent signalés";
            }
        });  

    svg.selectAll("rect")
        .data(dataCurrentDate.map(function(d) {
            console.log(d)
        if(d["Total Serious and Non-serious AEFI"] !== "")
            return d;
        }))
        .enter()
        .append("rect")
        .attr("fill", function(d) { return "#8c96c6"; })
        .attr("class","figure5Bar")
        .attr("id",function(d){
            if(d[""] == 0)
                return "blankBar"
        })
        .attr("y", function(d) { return y(short2txt(d["Total Serious and Non-serious AEFI"])); })
        .attr("x", function(d) { return x(0); })
        .attr("width", function(d) { return x(d["Total Serious and Non-serious AEFI Frequency"]) - x(0); })
        .attr("height", y.bandwidth())
        .append("title")
        .text(function(d,i){
            return d["Total Serious and Non-serious AEFI"] + ": " + d["Total Serious and Non-serious AEFI Frequency"];
        });
    
    
    $("#figure5-dropdown-measure").on("change", function(e) {
        updateFigure5(dataCurrentDate,this.value);
    });
    $("#figure4Toggle").on("click",function(e) {
        if(collapsedToggle){
            collapsedToggle = false;
            updateFigure5(fullData,"Total Serious and Non-serious AEFI");
            if (language == "en") {
              $("#figure4Toggle").text("Show Less Adverse Events");  
            } else {
              $("#figure4Toggle").text("Afficher moins d'effets secondaires");  
            }
            svg.select(".y-axis-2").selectAll(".seperators").remove();
             
        }
        else {
            collapsedToggle = true;
            updateFigure5(dataCurrentDate,"Total Serious and Non-serious AEFI");
            if (language == "en") {
              $("#figure4Toggle").text("Show More Adverse Events");  
            } else {
              $("#figure4Toggle").text("Afficher plus d'effets secondaires");  
            }
            
            _seperator.append("line")
                .attr("class","seperators")
                .attr("x1",-13)
                .attr("x2",13)
                .attr("y1",445)
                .attr("y2",440)
                .attr("stroke","black")
                .attr("stroke-width","1.5px");
                
                
            svg.select(".y-axis-2")
                .append("g")
                .style("cursor","pointer")
                .append("line")
                .attr("class","seperators")
                .attr("x1",-13)
                .attr("x2",13)
                .attr("y1",450)
                .attr("y2",445)
                .attr("stroke","black")
                .attr("stroke-width","1.5px")
                .on("click",function(e) {
                    d3.select("#figure4Toggle").dispatch('click');
                })
        }
    });
    
    function updateFigure5(data,measure){
        var color = "#8c96c6"; //(measure == "Total Non-serious AEFI" ? "#8c96c6" : "#88419d");
        var svg;
        var tempDataCurrentDate;
        colors = ["#88419d"];
        svg = d3.select("#figure5");
        let selectedBreakdown = null;
        tempDataCurrentDate = data.filter(function(d){
            return d[measure] !== "";
        });

        y.domain(tempDataCurrentDate.map(function(d) {
                return short2txt(d[measure]);
        }));
        
        let yMax = [];
        tempDataCurrentDate.map(function(d) {
            if(!isNaN(d[measure+" Frequency"])){
                yMax.push(+d[measure+" Frequency"]);
            }
        })
        
        x.domain([0, d3.max(yMax) + 10]);

        svg.select(".x-axis-2")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll(".tick")
            .style("font-size", 14)
            .select("line")
            .style("font-size", 12)
            .attr('y2', -height);
    
        svg.select(".x-axis-2")
            .selectAll("text")
            .style("font-size", 15)
            .style("text-anchor","middle")
            .attr("x", 0)
            .attr("y", 10);
        
        xAxisTitle
            .transition()
            .duration(500)
            .text(function() {
                if (language == "en")
                    return "Number of adverse events";
                else
                    return "Nombre d'effets secondaires";
                
            });  
    
        svg.select(".y-axis-2")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y))
            .selectAll("text")
            .attr("x",-10)
            .style("font-size", function(d){
                if(data.length > 12)
                    return 9;
                else
                    return 12;
            });
    
        svg.select(".y-axis-2")
            .selectAll("text")
            .style("font-size", function(d){
                if(data.length > 12)
                    return 9;
                else
                    return 12;
            });
            
        yAxisTitle
            .transition()
            .duration(500)
            .text(function() {
            if(measure == "Total Serious AEFI"){
                if (language == "en") {
                    return "Number of adverse events";
                }
                else {
                    return "Nombre d'événements indésirables";
                }
            }
                else {
                if (language == "en") {
                    return "Most frequently reported adverse events";
                }
                else {
                    return "Effets secondaires les plus souvent signalés";
            }
                }
            });
            d3.select("#blankBar")
                .attr("width", function(d) { return x(tempDataCurrentDate[10][measure + " Frequency"]) - x(0); });
                
            d3.select(".barG")
                .selectAll("rect")
                .data(tempDataCurrentDate)
                .exit()
                .remove();


        var currBars = d3.select(".barG").selectAll(".figure5Bar")
            .data(tempDataCurrentDate);

        currBars
            .enter()
            .append("rect")
            .merge(currBars)
            .attr("opacity",function(d){
                if(y(short2txt(d[measure])) == undefined){
                    return 0;
                }
                else
                    return 1;
            })
            .transition()
            .duration(500)
            .attr("y", function(d) { return y(short2txt(d[measure])); })
            .attr("x", function(d) { return x(0); })
            .attr("width", function(d) { return x(d[measure + " Frequency"]) - x(0); })
            .attr("height", y.bandwidth())
            .attr("fill", color)
            .selectAll("title")
            .text(function(d,i){
                return d[measure] + ": " + d[measure+" Frequency"];
            });
    }
}

function AESITable(data){
    let dropdownSelection = d3.select("#AESITable-dropdown-measure").property("value");
    let currentDate = data.length - 1;
    let currentDate2 = data[currentDate]["Data cut off date"];
    let dataCurrentDate = data.filter(function(d){ return d["Data cut off date"] == currentDate2});
    $(".totalAESI").text(dataCurrentDate[dataCurrentDate.length - 1]["TOTAL AESIs"]);
    
    let table = d3.select("#AESITable");
    let trHeader = d3.select("#tableHeader");
    let headerlist = ["Total"];
    let lastAESI = "";
    
    switch(dropdownSelection){
        case "Total Pfizer Events":
            headerlist = "Pfizer";
            break;
        case "Total Moderna Events":
            headerlist = "Moderna";
            break;
        case "Total COVISHIELD/AstraZeneca Events":
            headerlist = "COVISHIELD/AstraZeneca";
            break;
        case "Total Unspecified Events":
            headerlist = "Unspecified";
            break;
        case "TOTAL AESIs":
            headerlist = "Total";
            break;
    }
        
    trHeader
        .selectAll(".header3Col")
        .html(short2txt(headerlist));
        
    table.selectAll("tbody")
        .remove();
    table
        .append("tbody")
        .selectAll("tr")
        .data(dataCurrentDate)
        .enter()
        .append("tr")
        .html(function(d){
            // if(dropdownSelection == "All")//short2txt()
            //     return "<td>"+d["AESI Category"]+"</td><td>"+d["AESI"]+"</td><td>"+numberFormat(d["Total Pfizer Events"])+"</td><td>"+numberFormat(d["Total Moderna Events"])+"</td><td>"+numberFormat(d["Total COVISHIELD/AstraZeneca Events"])+"</td><td>"+numberFormat(d["Total Unspecified Events"])+"</td><td>"+numberFormat(d["TOTAL AESIs"])+"</td>";
            // else
            let rowspan = dataCurrentDate.filter(function(e){
              return e["AESI Category"] == d["AESI Category"];
            }).length
            
            if(short2txt(d["AESI"]) == "Subtotal" || short2txt(d["AESI"]) == "Sous-total"){
                lastAESI = d["AESI Category"];
                return "<td style='font-weight:bold;'>"+short2txt(d["AESI"])+"</td><td style='font-weight:bold;'>"+numberFormat(d[dropdownSelection])+"</td>";
            }
            else if(lastAESI == d["AESI Category"]){
                return "<td>"+short2txt(d["AESI"])+"</td><td>"+numberFormat(d[dropdownSelection])+"</td>";
            }
            else{
                if(short2txt(d["AESI Category"]) == "All AESI categories" || short2txt(d["AESI Category"]) == "Toutes les catégories AESI" ){
                    lastAESI = d["AESI Category"];
                    return "<td rowspan="+rowspan+" style='font-weight:bold;'>"+short2txt(d["AESI Category"])+"</td><td style='font-weight:bold;'>"+short2txt(d["AESI"])+"</td><td style='font-weight:bold;'>"+numberFormat(d[dropdownSelection])+"</td>";
                }else {
                    lastAESI = d["AESI Category"];
                    return "<td rowspan="+rowspan+">"+short2txt(d["AESI Category"])+"</td><td>"+short2txt(d["AESI"])+"</td><td>"+numberFormat(d[dropdownSelection])+"</td>";
                }
            }
            });
}
function wrapVertical(text, width) {
    text.each(function() {
        let text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1,
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", y-50).attr("y", -110).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width && line.length != 1) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", y-50).attr("y", -110).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}