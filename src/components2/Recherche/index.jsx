import React from 'react'

const Recherche = (props) => {
    const search = props.searchResults
  return (
    <div>
      <h2>Les résultats de recherche</h2>
      <ul>
        {search.map((result)=>(
            <li key={result.id}>{result.nom}</li>
        ))}
      </ul>
    </div>
  )
}

export default Recherche
