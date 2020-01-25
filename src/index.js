const { GraphQLServer } = require('graphql-yoga')
const utilisateurs = []
const posts = []
let estConnecte = false
let LePost= id
const typeDefs = `
type Query {
  utilisateurs: [User]
  info: String!
  posts: [Post]
  allPosts: [Post]
}
type Post{
  id:ID!
  sujet:String
  contenu:String
  statut:Boolean
  createdAt: String
  postedBy: User
}
type Mutation{
  validationPost(id:ID!):Post
  creationPost(sujet:String,contenu:String): Post
  inscription(noms:String,mot_de_passe:String,date_naissance:String): User
  connexion(noms:String,mot_de_passe:String): User
}
type User{
  id: ID!
  noms:String
  mot_de_passe:String
  date_naissance:String
  posts: [Post]
  createdAt: String
}
`
const dateActuelle = ()=>{
  const date = new Date() // on cree un objet qui contient la date du jour
return date.getFullYear().toString() + "-0"+ (date.getMonth()+1).toString() + "-"+ date.getDate().toString()
}
const getUserById = (id)=>{
  //utilisateurs.map(user=>user.id===id)
 const user = utilisateurs.filter(user=>user.id===id)[0]
 return user
}
const getpostid = (id)=>{
 const post = posts.filter(post=>post.id===id)[0]
 return post 
}
const resolvers = {
  Query: {
    info: () => {console.log('on est dans la fonction info'); return `This is the api for graphql-formation`},
    utilisateurs: ()=>utilisateurs,
    posts: ()=>{
      return posts.filter(post=>posts.statut===true) 
     },
     allPosts: ()=>{
      return posts
     }
  },
  Mutation:{
    inscription: (parent,args,context,info)=>{
      console.log("dans inscription")
      const user = args// recupere les informations de l'utilisateur
       // construit la date a afficher a l'utilisateur
     user.id= new Date().getTime() 
     user.posts = []
     user.createdAt = dateActuelle()
     // ajoute le nouvel utilisateur a la liste des utilisateurs
      utilisateurs.push(user)
      // retourne le premier utilisateur
      return utilisateurs[utilisateurs.length-1]
    },
    creationPost: (parent,args,context,info)=>{
      post.id= new Date().getTime()
      const post = {...args, statut:false,createdAt: dateActuelle()}
       
      // verifie si l'utilisateur est connecte
        if(estConnecte)
        {
          console.log(estConnecte) // affichage de l'id de l'utilisateur connecte
          post.postedBy = getUserById(estConnecte)
        // si oui on recupere l'id de l'utilisateur connecte
        }
        // si non il se doit se connecter d'abord
        else{
          throw "Connectez vous d'abord avant de pouvoir poster"
        }
        // on cree le post
        posts.push(post)
        return post

    },
    validationPost: (parent,args,context,info) => {
      const post = getpostid(id)
      const id= post.id 
      post.statut= true 
      return post;
    }
    ,
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
                estConnecte =  utilisateurs[i].id
                return utilisateurs[i]
            }
            else{
                console.log('le mot de passe ne correspond pas')
                throw "Mot de passe incorrect"
            }
        }  
        else if(i===utilisateurs.length-1)
        {
            console.log("l'utilisateur n'est pas chez nous")
            throw "Utilisateur n'existe pas"
        }
        }
      }
    },
    validationPost: (parent,args,context,info)=>{
      const post = {...args, statut:false,createdAt: dateActuelle()}
      if (LePost)
        {
          console.log(LePost) 
          post.id = getUserById(LePost)
        }
        else if{
          throw "le post n'est pas accepté"
        }
        return post

    }
  }



const server = new GraphQLServer({
  typeDefs,
  resolvers,
})
server.start(() => console.log(`Server is running on http://localhost:4000`))