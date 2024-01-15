export class GetToken{
    static getToken(header){
        const autho =  header.authorization;
        const head = autho.split(' ');
        
        return head[1];
    }
    
}