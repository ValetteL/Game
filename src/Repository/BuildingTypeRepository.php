<?php

namespace App\Repository;

use App\Entity\BuildingType;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method BuildingType|null find($id, $lockMode = null, $lockVersion = null)
 * @method BuildingType|null findOneBy(array $criteria, array $orderBy = null)
 * @method BuildingType[]    findAll()
 * @method BuildingType[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class BuildingTypeRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, BuildingType::class);
    }

    // /**
    //  * @return BuildingType[] Returns an array of BuildingType objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('b.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?BuildingType
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
