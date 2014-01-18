/**
 * Created with JetBrains WebStorm.
 * User: VICTOR
 * Date: 04.02.2013
 * Time: 02:51
 * To change this template use File | Settings | File Templates.
 */
function Nod(){
    var s , d , inf;
    s = null; d = null; inf = null;
}
String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};
function Formula_(_formula)
{
    var op;
    var accepted  = "qwertyuiopasdfghjklzxcvbnm10";
    var variabile = "qwertyuiopasdfghjklzxcvbnm";
    var paranteze = "()";
    var variabile_formula = new Array();
    var operatoriAcceptati = "+|*^>!"; // or, sheffer,and,implicity,not
    var operatoriUnari = "!";
    var operatoriBinari = "+|*^>";
    var prioritatiOperatori = new Array();
    Array.prototype.pr = function (o){
        var i;
        for (i=0; i < this.length; ++i){
            if(this[i].op == o) return this[i].p;
        }
        return -1;
    }
    var f_rez     = new Array();
    var FNDP      = new Array();
    var FNCP      = new Array();
    var formula   = _formula;
    var postFixFormula;
    var numarOperatori=0;
    var arbore ;
    var cazFormula;
    var nrTotalVariabileFormula=0;
    var numarNoduriFormula=0;
    var vArray = new Array(); //vector pt calcularea arboreului
    var parentsArray = new Array();
    var jsonTree;
    var treeRootSymbol = "$";
    var parantezare;
    this.TreeJSON="";
    this.init_formula = function()
    {
        var v = new Array();
        var vv = new Array();
        prioritatiOperatori.push({op: "!", p: 0});
        prioritatiOperatori.push({op: "*", p: 1});
        prioritatiOperatori.push({op: "+", p: 2});
        prioritatiOperatori.push({op: "|", p: 2});
        prioritatiOperatori.push({op: ">", p: 2});
        prioritatiOperatori.push({op: "^", p: 2});
        formula=delSpace(formula);
        formula=formula.toLowerCase();
        var n="";

        $("#tabelAdevar th").remove();
        $("#tabelAdevar tr").remove();
        $("#tabelAdevar tr").remove();
        $("#FormulaInfos p").remove();
        $("#FormulaInfos").hide();
        if(formula.length == 0){
            $("form input[name=formula]").css("background-color","#F3FEFF");
            $("form input[name=formula]").css("color","#909090;");
            $("#FormulaValidaText").hide();
         }
        else
        if(testS(formula))
        {
            $("#FormulaValidaText").html("CORECTA SINTACTIC !");
            $("form input[name=formula]").css("color","#3e5706");
            $("form input[name=formula]").css("background-color","#a5cd4e");
            $("#FormulaValidaText").css("color","#0bcd00");
            $("#FormulaValidaText").show();
            //numarNoduriFormula = numarNoduri();
            formula = " " + formula + " ";
            console.log("FORMULA VALIDA SINTATIC !");
            console.log(formula);
            v=tokenizare(formula,"!*+^|()> ");
            for(var i=0; i < v.length; i++)
            { vv[i] = v[i].tkn;	}
            var nrVariabile = numar_variabile(vv);
            op = new Operatori(nrVariabile);
           // ================ parantezare ==============================
            vv=parantezareVariabile(vv);
            if(vv.indexOf("!")>0) vv = parant_NOT(vv);
            if(vv.indexOf("*")>0) vv = parantezare_Binar(0,vv,"*");
            if(vv.indexOf("+")>0) vv = parantezare_Binar(0,vv,"+");
            if(vv.indexOf("^")>0) vv = parantezare_Binar(0,vv,"^");
            if(vv.indexOf("|")>0) vv = parantezare_Binar(0,vv,"|");
            if(vv.indexOf(">")>0) vv = parantezare_Binar(0,vv,">");
            console.log("PARANTEZARE FINALA: ", n=delSpace(retoken(vv)));
            parantezare = n;
            if(testS(n)==1)
                console.log("formula VALIDA dupa parantezare");
            else console.log("FORMULA INVALIDA dupa parantezare");
            //=============== end parantezare ============================
            calcul_f(vv); // calcularea formulei + vectorului de noduri pt arbore + json pt svg
            creazaTabelAdevar(); // crearea tabelului grafic
            this.TreeJSON=jsonTree.replace("^","âŠ•").replace(">","â†’");
            formeNormale();
            console.log("FNDP : ",retoken(FNDP)); console.log("FNCP : ",retoken(FNCP));
        }
        else {
            console.log("formula NU ESTE valida sintactic");
            $("form input[name=formula]").css("color","#FF000B");
            $("form input[name=formula]").css("background-color","#FF9995");
            $("#FormulaValidaText").css("color","#FF0000");
            $("#FormulaValidaText").html("NU E CORECTA SINTACTIC !") ;
            $("#FormulaValidaText").show();
        }
    }

    function formeNormale(){
        $("#FNCP").val(retoken(FNCP));
        $("#FNDP").val(retoken(FNDP));
        $("#Par").val(parantezare);
        var i,satisfiabila=0,valida=1;
        for(i=0;i<f_rez.length;i++){
            if(f_rez[i]==1) satisfiabila=1;
            if(f_rez[i]==0) valida=0;
        }
        if(valida==1){
        $("#FormulaInfos").prepend("<p>Formula este VALIDA !</p>")
        }
        else{
            $("#FormulaInfos").prepend("<p>Formula NU este VALIDA !</p>")
        }

        if(satisfiabila==1){
            $("#FormulaInfos").prepend("<p>Formula este SATISFIABILA !</p>")
        }
        else{
            $("#FormulaInfos").prepend("<p>Formula NU este SATISFIABILA !</p>")
        }
        $("#FormulaInfos").show();
    }

    function numarNoduri(){
        for(var z = 0; z<formula.length;z++){
            if(operatoriAcceptati.indexOf(formula.charAt(z)) >=0)
                numarOperatori++;
            else if(variabile.indexOf(formula.charAt(z))>=0)
                nrTotalVariabileFormula++;
        }
        return nrTotalVariabileFormula + numarOperatori;
    }

    function creazaTabelAdevar(){
        $("#tabelAdevar>thead").append("<tr></tr>");
        var table = $("#tabelAdevar>thead>tr");
        var i, j,stop=0; var k = 0;
        var rezultat = "f(";
        for(i=0; i < variabile_formula.length;i++){
            rezultat += variabile_formula[i].lit + ",";
            table.append("<th>"+variabile_formula[i].lit+"</th>");
        }
        rezultat = rezultat.slice(0,rezultat.length-1) + ")";
        table.append("<th>"+rezultat+"</th>");

        table = $("#tabelAdevar");
        for(i=0; i < Math.pow(2,variabile_formula.length);i++){
            table = table.append("<tr>");
            // adaugam valorile pt variabile
            for(j=k; j < Math.pow(2,variabile_formula.length)*variabile_formula.length;++j,++k){
                $("#tabelAdevar tr:last").append("<td>"+op.Nvar_tabel2[k]+"</td>");
                stop++;
                if(stop == variabile_formula.length)
                { stop=0; ++k; break;  }
            }
            $("#tabelAdevar tr:last").append("<td>"+(+f_rez[i])+"</td>");
        }
    }

    function creeazaArbore(){
        var i;
        var allChild=treeRootSymbol;
        for(i=0;i<parentsArray;i++){
            allChild+=parentsArray[i].children;
        }
    var plm=0;
    }

    function delSpace(originalstring)     //scoate spatiile din formula
    {
        var original=originalstring.split(" ");
        return(original.join(""));
    }

    function checkF(c) //check first
    {
        var accepted2 = "(!qwertyuiopasdfghjklzxcvbnm01";
        c=c.toLowerCase();
        if(accepted2.indexOf(c.charAt(0)) < 0) return 0;
        return 1;
    }
    function checkL (c) // check last
    {
        var accepted2 = ")qwertyuiopasdfghjklzxcvbnm01";
        c=c.toLowerCase();
        if(accepted2.indexOf(c.charAt(c.length-1)) < 0) return 0;
        return 1;
    }
    function checkP(s) // check paranteze
    {
        var i=0,p=0;
        for(i=0;i<s.length;i++)
        {
            if(s.charAt(i) == '(') p++;
            else if (s.charAt(i) == ')') p--;
        }
        if(p==0) return 1;
        return 0;
    }
    function checkS(s)
    {
        var accepted2 = "()*+^!|>qwertyuiopasdfghjklzxcvbnm01";
        var i;
        s=s.toLowerCase();
        for(i=1;i<formula.length-1;i++)
            if(accepted2.indexOf(s.charAt(i)) < 0 ) return 0;
        return 1;
    }
    function testS(s)
    {
        if(!checkF(s) || !checkL(s) || !checkP(s) || !checkS(s) || !pass(s)) return 0;
        return 1;
    }

    function pass(s) //analizor sintactic
    {
        var  i;
        var s1="(qwertyuiopasdfghjklzxcvbnm01!"; // ce poate urma dupa negatie si orice operator binar
        var s2="+|*.~^>)"; // ce poate urma dupa o variabila
        var s3="+|*.~^>)"; //ce poate urma dupa )

        for(i=0;i<s.length;i++)  //parcurg formula
        {
            if(s.charAt(i) == "!")
            { if(s1.indexOf(s.charAt(i+1)) < 0) return 0; }
            if("qwertyuiopasdfghjklzxcvbnm01".indexOf(s.charAt(i))>=0) // pentru variabila
            {
                if(s2.indexOf(s.charAt(i+1)) < 0) return 0;
            }
            // pentru orice operator binar (xor, sheffer, +, *)
            if("+|*^>".indexOf(s.charAt(i)) >=0)
            {
                if(s1.indexOf(s.charAt(i+1)) < 0) return 0;
            }
            if(s.charAt(i) == "(") { if(s1.indexOf(s.charAt(i+1)) < 0) return 0;}
            if(s.charAt(i) == ")") { if(s3.indexOf(s.charAt(i+1)) < 0) return 0;}

        }
        return 1;
    }
    function insert(a,index,value)
    {
        a.splice(index,0,value);
        //console.log(a);
    }

    function tokenizare(f,c) // TOKENIZARE
    {
        var t  = new Array(),i;

        for(i=0; i<f.length;i++)
        {
            if(c.indexOf(f.charAt(i)) > -1 )
            {
                t.push({tkn:f.substring(0,i), st:0, sf:i-1});
                t.push({tkn:f.charAt(i), st:i, sf:i});
                var sw=true;
            }
            if(sw==true) break;
        }

        i=i+1;
        while(i<f.length)
        {
            if(c.indexOf(f.charAt(i)) > -1)
            {
                t.push({tkn:f.substring(t[t.length-1].sf+1,i), st:t[t.length-1].st+1, sf:i-1});
                t.push({tkn:f.charAt(i), st:i, sf:i});

            }
            i++;
        }
        t.push({tkn:f.substring(t[t.length-1].sf+1,i), st:t[t.length-1].st+1, sf:f.length-1});
        for(i=0;i<t.length;i++)
        {
            if(t[i].tkn=="") t.splice(i,1);
        }
        return t;
    }

    function afiseazaVector(m)
    {
        for( var i  = 0; i < m.length; i++ )
        {
            //console.log( m[i].tkn, m[i].st, m[i].sf );
            console.log( m[i] );
        }
    }
    function retoken(a)
    {
        var s="",i=0;
        for(i=0;i<a.length;i++)
        {
            s+=a[i];
        }
        return s;
    }

    function retokenLit(a)
    {
        var s="",i=0;
        for(i=0;i<a.length;i++)
        {
            s+=a[i].lit;
        }
        return s;
    }

    function parant_NOT(s)
    {
        var i, p=0, ii=0;
        var n,j; n=0;
        for(i=1; i<s.length-1;i++)
        {
            if(s[i] == '!')
            {	ii=i;
                if(s[i-1] != '(')
                {
                    while(s[ii] == '!') // avem !!!..!
                    {
                        insert(s,ii,'('); n++;
                        ii=ii+2;
                    }
                    p+=1; ii=ii+1;
                    while(p!=0) {
                        if(s[ii]=='(') p++;
                        else if(s[ii]==')') p--;
                        ii++;
                    }
                    i+=(n*2);
                    while(n!=0) { insert(s,ii,')'); n--; }
                }
                else { j=i; p=0;
                    // avem ( in fata not-ului si trebuie de verificat daca e pt not
                    // mergem pana la prima paranteza deschisa, si numaram pana se inkide ea si daca dupa ea nu e ) atunci naspa
                    while(s[j]!='(') j++;
                    p++; j++;
                    while(p) { if (s[j] == ')') p--; else if(s[j]== '(') p++; j++; }
                    if(s[j]!=')')
                    {
                        insert(s,i,'(');
                        insert(s,j+1,')');
                        i++;
                    }
                }
            }
        }
        return s;
    }


    function parantezareVariabile(v)
    {
        var i;
        for(i=1; i<v.length-1;i++)
        {
            if(accepted.indexOf(v[i])>0)
            {
                if(v[i-1]!=='(') { insert(v,i,'('); insert(v,i+2,')'); i+=2; }
                else if (v[i-1]=='(' && v[i+1]!=')') { insert(v,i,'('); insert(v,i+2,')'); i+=2; }
            }
        }
        return v;
    }

    function parantezare_Binar(st,s,c)
    {
        var start = st, i, notOp = false;
        for(i=start; i<s.length-1;i++)
        {
            if(s[i].toString().indexOf(c)>-1)
            {
                var p= 1, j = i- 2,jj=i+2;
                while(p) { if(s[j] == ')') p++; else if (s[j]== '(') p--; j--; if(s[j] == '!') notOp = true;  } // stanga operatorului
                p=1;
                while(p) { if(s[jj] == '(') p++; else if (s[jj]== ')') p--; jj++; if(s[jj] == '!') notOp = true;  } // dreapta operatorului
               if(s[j]!='(' || s[jj]!=')' )
               {
                    j++;
                    insert(s,j,'(');
                    //j = i+3;
                    //p=1;
                   // while (p) { if(s[j] == '(') p++; else if (s[j]== ')') p--; j++; }
                    //j--;
                    insert(s,jj,')');
                    i++;
                }
            }
        }
//        if(s.slice(start).indexOf(c) > -1 )
//            return s = parantezare_Binar(start,s,c);
        return s;
    }

    function numar_variabile(s)
    {
        var i, vr = new Array();
        function check_vr(v)
        {
            var ii;
            var l = vr.length;
            for(ii=0;ii<vr.length;ii++)
                if(vr[ii].lit == v)
                    return false;
            return true;
        }
        for(i=0; i<s.length; i++)
        {
            if(variabile.indexOf(s[i].toString()) >= 0 && check_vr(s[i])==true)
                vr.push({lit:s[i], val:null});
        }
        vr.sort(function (a, b) {
            return (b.lit < a.lit);});
        variabile_formula=vr;
        return variabile_formula.length;
    }

   function calcul_f(s)
    {
        var r, nv,i,k=1, kk=0, j;
        var ss = new Array();    ss = s.slice(0);
        var _ss = new Array();  _ss = s.slice(0);
        determinareCazFormula(retoken(_ss.slice(1,ss.length-1))); // (...) * x sau invers
        //vArray.push({id:0,pid:-1,des:"$"});
        infixToPostfix(_ss.slice(1,ss.length-1).elimParVarFormula(accepted));
        //vArray.sort(compare);
        nv=numar_variabile(s);
        var valori_var = new Array();
        valori_var=op.Nvar_tabel2;
        while(k <= Math.pow(2,nv))
        {
            for(i=0; i<variabile_formula.length;i++)
            {
                variabile_formula[i].val = valori_var[kk];
                kk++;
            }
            // inclocuim variabilele cu valorile corespunzatoare din tabel
            for(i=0; i<ss.length;i++)
            {
                if(variabile.indexOf(ss[i])>= 0)
                {
                    for(j=0; j<variabile_formula.length;j++)
                    {
                        if(variabile_formula[j].lit == ss[i])
                        {
                            ss.splice(i-1,3,variabile_formula[j].val);
                            _ss.splice(i-1,3,variabile_formula[j].lit);
                            j=variabile_formula.length;
                        }
                    }
                }
            }
            //calculam efectiv formula
            r=calcul_efectiv(ss.slice(1,ss.length-1));
            f_rez.push(r); // bagam rezultatul in vector
            //FNDP
            if(r==true) // construim FNDP-ul
            {   FNDP.push('(');
                for(i=0;i<variabile_formula.length;i++)
                {
                    if(variabile_formula[i].val == 0)	 FNDP.push("!");
                    FNDP.push(variabile_formula[i].lit);
                    FNDP.push('*');
                }
                FNDP.pop();
                if(FNDP.length!=0) FNDP.push(')');
                FNDP.push('+');
            }
            else if(r==false)// construim FNCP-ul
            {   FNCP.push('(');
                for(i=0;i<variabile_formula.length;i++)
                {
                    if(variabile_formula[i].val == 1)	 FNCP.push("!");
                    FNCP.push(variabile_formula[i].lit);
                    FNCP.push('+');
                }
                FNCP.pop();
                if(FNCP.length!=0)FNCP.push(')');
                FNCP.push('*');
            }
            console.log("REZULTATUL pt runda ",k,":",r);
            //var strng; strng = retoken(ss);
            ss = s.slice(0);
            k++;
        }  FNDP.pop(); FNCP.pop();
        return r;
    }


    function determinareCazFormula(f){
        if(f.charAt(f.length-1)==')' && (retoken(variabile_formula)).indexOf(f.charAt(f.length-2))>=0){
            cazFormula = 0; // (...) * x
        } else if (f.charAt(f.length-1)==')'&&f.charAt(f.length-2)==')'){
            if (f.charAt(f.length-1)==')'&&f.charAt(f.length-2)==')'&&f.charAt(f.length-3)==')'){
                cazFormula = 1; // x * (...)
            }
            if(f.charAt(f.length-4)=='!') cazFormula = 0; // (...) * x
            else cazFormula = 1; // x * (...)
        }
    }

    function calcul_efectiv(s)  // calculeaza formula
    {
        var i,ii,p=0;
        //mergand pana la cea mai interioara paranteza -> rezolvam -> apelare recursiva pt noul array rezolvat
        for(i=0;i<s.length;i++)
        {
            if(s[i]=='(') { p++; ii=i; }
            else if (s[i]==')') // we have a winner ! :> si putem rezolva
            {
                p--;
                if(i-ii == 2) // avem (a)
                { s.splice(ii,3,s[i-1]); calcul_efectiv(s); }
                else if(i-ii == 3) // avem (!a)
                {
                    s.splice(ii,4,op.not(s[i-1])); calcul_efectiv(s);
                }
                else if(i-ii > 3 ) // avem (a op b)
                {
                    if(s[i-2]=='*') { s.splice(ii,5,op.and(s[i-3],s[i-1])); calcul_efectiv(s); }
                    if(s[i-2]=='+') { s.splice(ii,5,op.or(s[i-3],s[i-1])); calcul_efectiv(s);  }
                    if(s[i-2]=='^') { s.splice(ii,5,op.xor(s[i-3],s[i-1])); calcul_efectiv(s); }
                    if(s[i-2]=='|') { s.splice(ii,5,op.sheffer(s[i-3],s[i-1])); calcul_efectiv(s); }
                    if(s[i-2]=='>') { s.splice(ii,5,op.impl(s[i-3],s[i-1])); calcul_efectiv(s); }
                }
            }
        }
        var result=s[0];
        return (Boolean)(result);
    }
    function preorder(nod){
        if(nod != null){ jsonTree += nod.inf; }
        if(nod.s != null && nod.d != null){
            jsonTree += "\"children\":[";
            preorder(nod.s);
            preorder(nod.d);
            jsonTree += "]}";
        }
        if(nod.s != null && nod.d == null){
            jsonTree += "\"children\":[";
            preorder(nod.s);
            jsonTree += "]}";
        }
        if(nod.s == null && nod.d != null){
            jsonTree += "\"children\":[";
            preorder(nod.d);
            jsonTree += "]}";
        }
    }

    function infixToPostfix(s){
        var output = new Array(),stack = new Array(),i;
        for(i = 0; i < s.length; ++i){
            if(operatoriAcceptati.indexOf(s[i]) < 0 && paranteze.indexOf(s[i]) < 0){ output.push(s[i]); } // e variabila
            if(operatoriAcceptati.indexOf(s[i]) >= 0){
                while(operatoriAcceptati.indexOf(stack[stack.length-1]) >= 0 &&
                       (prioritatiOperatori.pr(stack[stack.length-1]) <= prioritatiOperatori.pr(s[i])) ){
                    output.push(stack.pop());
                }
                stack.push(s[i]);
            }
            if(s[i] == "("){ stack.push(s[i]);}
            if(s[i] == ")"){
                while(operatoriAcceptati.indexOf(stack[stack.length-1])>=0 && stack[stack.length-1]!="(") output.push(stack.pop());
                stack.pop();
            }
        }
        var last = stack.pop();
        if(last != undefined) output.push(last);
        postFixFormula = retoken(output);
        console.log(postFixFormula);
        stack = []; var stack2 = [];
        for(i=0; i < output.length; ++i){
            //vArray.push({id:output-i, pid: -1, des:output[i]});
            if(accepted.indexOf(output[i]) >= 0){
                stack.push({id:output.length- i, pid: -1, des:output[i]});
                stack2.push(new Nod());
                stack2[stack2.length-1].inf = "{ \"name\":\"" + output[i]+ "\" }";
            }
            if(operatoriBinari.indexOf(output[i]) >= 0){
                stack[stack.length-1].pid = stack[stack.length-2].pid = output.length-i;
                var newNod = new Nod(); newNod.inf = "{ \"name\":\"" +  output[i] + "\",";
                vArray.push(stack.pop());  // operand left
                newNod.s = stack2.pop();
                vArray.push(stack.pop());  // operand right
                newNod.d = stack2.pop();
                stack.push({id:output.length-i, pid: -1, des:output[i]});     // push the operator
                stack2.push(newNod);
            }
            if(operatoriUnari.indexOf(output[i]) >=0 ){
                stack[stack.length-1].pid = output.length-i;
                var newNod = new Nod(); newNod.inf = "{ \"name\":\"" +  output[i] + "\",";
                vArray.push(stack.pop());
                newNod.s = stack2.pop();
                stack.push({id:output.length-i, pid: -1, des:output[i]});
                stack2.push(newNod);
            }
        }
        jsonTree = "";
        preorder(stack2[0]);
        jsonTree = jsonTree.replaceAll("}{","},{");
        var last = stack.pop();
        if(last != undefined) vArray.push(last);
    }


    var parentOffset=0;
  }

Array.prototype.elimParVarFormula = function(varFormula) {
    var i, n = this.length;
    for (i = 0; i < n; ++i) {
        if(varFormula.indexOf(this[i])>=0){
            if(this[i+1]==')' && this[i-1]=='('){
                this.splice(i+1,1);
                this.splice(i-1,1);
            }
        } ;
    }
    return this;
};

function compare(a,b) {
    if (a.id < b.id)
        return -1;
    if (a.id > b.id)
        return 1;
    return 0;
}

/*Array.prototype.insert = function(index, value:*) {
 var original = this.slice(); // a, c, d
 var temp = original.splice(index); // c, d
 original[index] = value; // b
 original = original.concat(temp); // a, b, c, d
 return original;
 };*/

/*  ================================== CLASA Operatori =================================================== */
function Operatori (nr)
{
    var _Nvar_tabel = new Array();     // ordinea din tabel
    var _Nvar_tabel2 = new Array();     // ordinea pt calcularea formulei
    this.Nvar_tabel = _Nvar_tabel;
    this.Nvar_tabel2 = _Nvar_tabel2;

    function OperatoriInit()
    {
        var i, j, k;
        for(i=1; i<=nr;i++)
        {
            j=0;
            while(j<Math.pow(2,nr))
            {
                for(k=0; k<Math.pow(2,nr)/Math.pow(2,i); k++) { _Nvar_tabel.push(0); }
                for(k=0; k<Math.pow(2,nr)/Math.pow(2,i); k++) { _Nvar_tabel.push(1); }
                j+=2*k;
            }
        }

        for(i=0; i<Math.pow(2,nr);i++)
        {
            for(j=0;j<nr;j++)
            {
                _Nvar_tabel2.push(_Nvar_tabel[Math.pow(2,nr)*j+i]);
            }
        }
        var x = 0;
    }
    OperatoriInit();
}
Operatori.prototype.xor = function(a, b)
{
    if (a==b) return 0;
    return 1;
}
Operatori.prototype.sheffer = function(a, b)
{
    if(a==1 && b==1) return 0;
    return 1;

}
Operatori.prototype.and = function(a, b)
{
    if(a==1 && b==1) return 1;
    return 0;
}
Operatori.prototype.or = function(a, b)
{
    if(a==1 || b==1) return 1;
    return 0;
}
Operatori.prototype.not = function(a)
{
    if(a==0) return 1;
    if(a==1) return 0;
    return a;
}
Operatori.prototype.impl = function(a, b)
{
    if(a==0) return 1;
    if(a==1 && b==1) return 1;
    return 0;
}
/* =============================================================================================================*/

var myF;
function start(){
    var input = $("form input[name=formula]").val();
    myF   = new Formula_(input);
    myF.init_formula();
}

function ShowTheTree(){
    root = JSON.parse(myF.TreeJSON);
    update(root);
}
