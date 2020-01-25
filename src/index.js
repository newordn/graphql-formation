const { GraphQLServer } = require('graphql-yoga')
const utilisateurs = []

const typeDefs = `
type Query {
  utilisateurs: [User]
  info: String!
  posts: [Post] // listage des posts
}
type Post{
  sujet:String
  contenu:String
  statut:Boolean
  createdAt: Strign
}
type Mutation{
  validationPost(id:ID!):Post
  creationPost(sujet:String,contenu:String): Post
  inscription(noms:String,mot_de_passe:String,date_naissance:String): User
  connexion(noms:String,mot_de_passe:String): Boolean
}
type User{
  noms:String
  mot_de_passe:String
  date_naissance:String
  createdAt: String
}
`

const resolvers = {
  Query: {
    info: () => {console.log('on est dans la fonction info'); return `This is the api for graphql-formation`},
    utilisateurs: ()=>utilisateurs
  },
  Mutation:{
    inscription: (parent,args,context,info)=>{
      console.log("dans inscription")
      const user = args// recupere les informations de l'utilisateur
      const date = new Date() // on cree un objet qui contient la date du jour
     // construit la date a afficher a l'utilisateur
      user.createdAt = date.getFullYear().toString() + "-0"+ (date.getMonth()+1).toString() + "-"+ date.getDate().toString()
     // ajoute le nouvel utilisateur a la liste des utilisateurs
      utilisateurs.push(user)
      // retourne le premier utilisateur
      return utilisateurs[utilisateurs.length-1]
    },
    connexion: (parent,args,context,info)=>{
      // parse les donnees 
      const noms = args.noms
      const password = args.mot_de_passe
      // verification de l'existence de l'utilisateur
      for(i=0;i<=utilisateurs.length-1;i++){
        if(utilisateurs[i].noms===noms){
            console.log("l'user est chez nouss")
            if(utilisateurs[i].mot_de_passe===password){
                console.log('il est connecte')
                return true
            }
            else{
                console.log('le mot de passe ne correspond pas')
                return false
            }
        }  
        else if(i===utilisateurs.length-1)
        {
            console.log("l'utilisateur n'est pas chez nous")
            return false
        }
        }
      }
        // si non erreur 
        // si oui verification du mot de passe
            // si oui c'est 
            // sinon erreur
    }
  }



const server = new GraphQLServer({
  typeDefs,
  resolvers,
})
server.start(() => console.log(`Server is running on http://localhost:4000`))