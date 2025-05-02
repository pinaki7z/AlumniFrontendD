import React, { useState, useEffect } from 'react';
import PageTitle from '../../PageTitle';
import { BsGlobe } from 'react-icons/bs';
import Members from '../../../pages/Members';
import { useParams } from 'react-router-dom';
import baseUrl from '../../../config';
import Profilecard from '../../../components/Profilecard';

export const AddMembers = ({type, members}) => {
  // const [members, setMembers] = useState([]);
  const [owner, setOwner] = useState('');
  const icon = <BsGlobe style={{ color: '#87dbf2' }} />
  const { _id,id } = useParams();
  console.log("members add",members);

  return (
    <div style={{display: 'flex', gap: '15px'}}>
      {/* <PageTitle title="Add/Remove members" style={{ marginTop: '0px' }} icon={icon} /> */}
      {/* <Members addButton={true} groupMembers={members} owner={owner} deleteButton={false}/> */}
      {members.map((member) => (
                <Profilecard
                  key={member._id}
                  member={member}
                  owner={owner}
                  groupMembers={members}
                  deleteButton={false}
                  //handleDelete={() => handleDelete(member._id)}
                />
              ))}
    </div>
  )
}
