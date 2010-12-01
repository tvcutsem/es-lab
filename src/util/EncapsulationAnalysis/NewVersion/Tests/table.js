  var trustedTable = [function NOTreachable(){}];

  attacker = { 
               push: function reachable1(x){trustedTable.push(x);},
               store: function reachable2(i,x){trustedTable[$A$Num(i)] = x;}
            } 

