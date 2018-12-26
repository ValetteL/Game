<?php

namespace App\Repository;

use App\Entity\Sphere;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method Sphere|null find($id, $lockMode = null, $lockVersion = null)
 * @method Sphere|null findOneBy(array $criteria, array $orderBy = null)
 * @method Sphere[]    findAll()
 * @method Sphere[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SphereRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, Sphere::class);
    }

    // /**
    //  * @return Sphere[] Returns an array of Sphere objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('s.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Sphere
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
